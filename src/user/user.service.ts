import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import type { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { FilterQuery } from 'mongoose'
import { RoleService } from '../role/role.service'
import { UserModel } from './user.model'
import { PasswordService } from './password.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { FindUserDto } from './dto/find-user.dto'
import { FullListResponse } from '../common/responses/full-list.response'
import { ROLE_NOT_FOUND } from '../role/role.constants'
import {
	FAILED_TO_CREATE_USER,
	FAILED_TO_UPDATE_USER,
	FILED_EMAIL_CONFIRMATION_TOKEN,
	FILED_PASSWORD_COMPARE,
	FORBIDDEN_TO_CHANGE_LAST_ADMIN_FIELD,
	FORBIDDEN_TO_DELETE_LAST_ADMIN,
	FORBIDDEN_TO_DELETE_NOT_SELF_ACCOUNT,
	USER_ALREADY_EXISTS,
	USER_DELETED_MESSAGE,
	USER_NOT_FOUND
} from './user.constants'
import { ConfigService } from '@nestjs/config'
import { MailService } from '../mail/mail.service'
import { v4 as uuidv4 } from 'uuid'
import { LoginDto } from '../auth/dto/login.dto'
import { TokenService } from '../token/token.service'
import { TokensResponse } from '../auth/responses/tokens.response'
import { DeleteDto } from '../auth/dto/delete.dto'

type ReplacePasswordWithHash<T extends CreateUserDto | UpdateUserDto> = Omit<T, 'password'> & {
	passwordHash: string
}

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
		private readonly roleService: RoleService,
		private readonly passwordService: PasswordService,
		private readonly mailService: MailService,
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService
	) {}

	private async getUserWithPasswordHash<T extends CreateUserDto | UpdateUserDto>(
		dto: T
	): Promise<ReplacePasswordWithHash<T> | T> {
		const { password, ...rest } = dto

		if (!password) {
			return dto
		}

		const passwordHash = await this.passwordService.hashPassword(dto.password)
		return { ...rest, passwordHash }
	}

	private async checkRoleExists(role: CreateUserDto['role']): Promise<boolean> {
		const roleExists = await this.roleService.roleExists(role)
		if (!roleExists) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return !!roleExists
	}

	private async confirmEmailHandler(email: string): Promise<string> {
		const emailConfirmationToken = uuidv4()
		await this.mailService.sendConfirmEmail(email, emailConfirmationToken)
		return emailConfirmationToken
	}

	private async userExists(email: string): Promise<boolean> {
		const user = await this.userModel.findOne({ email }).exec()
		return !!user
	}

	private async isLastAdminUser(_id: string): Promise<boolean> {
		const adminUsers = await this.userModel
			.find({ role: this.configService.get('roles.admin') })
			.exec()
		return adminUsers.length === 1 && adminUsers[0]._id.toString() === _id
	}

	async resetPasswordHandler(email: string): Promise<string> {
		const resetPasswordToken = uuidv4()
		await this.mailService.sendResetPassword(email, resetPasswordToken)
		return resetPasswordToken
	}

	async validateUser(email: string, password: string): Promise<DocumentType<UserModel>> {
		const user = await this.userModel.findOne({ email }).exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		const isPasswordSuccess = await this.passwordService.comparePassword(
			password,
			user.passwordHash
		)
		if (!isPasswordSuccess) {
			throw new HttpException(FILED_PASSWORD_COMPARE, HttpStatus.FORBIDDEN)
		}
		return user
	}

	async initialize(dto: CreateUserDto): Promise<boolean> {
		const userExists = await this.userExists(dto.email)
		if (userExists) {
			console.log(`User with email ${dto.email} already exists`)
			return true
		}
		const adminUserExist = await this.find({ role: dto.role, limit: 1, offset: 0 })
		if (adminUserExist.items.length) {
			console.log(`User with role ${dto.role} already exists`)
			return true
		}
		const user = await this.getUserWithPasswordHash(dto)
		const userWithConfirmEmail = { ...user, isActive: true }
		const createdUser = await this.userModel.create(userWithConfirmEmail)
		if (!createdUser) {
			console.log(`Failed to create user with email ${dto.email}`)
			return false
		}
		return !!createdUser
	}

	async create(dto: CreateUserDto): Promise<DocumentType<UserModel>> {
		if (!dto.role) {
			dto.role = this.configService.get('roles.user')
		} else {
			await this.checkRoleExists(dto.role)
		}
		const userExists = await this.userExists(dto.email)
		if (userExists) {
			throw new HttpException(USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST)
		}
		const user = await this.getUserWithPasswordHash(dto)
		const emailConfirmationToken = await this.confirmEmailHandler(user.email)
		const userWithConfirmEmail = { ...user, isActive: false, emailConfirmationToken }
		const createdUser = await this.userModel.create(userWithConfirmEmail)
		if (!createdUser) {
			throw new HttpException(FAILED_TO_CREATE_USER, HttpStatus.INTERNAL_SERVER_ERROR)
		}
		return createdUser
	}

	async findUserById(id: string): Promise<DocumentType<UserModel>> {
		const user = await this.userModel.findOne({ _id: id }).exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return user
	}

	async findUserByEmail(email: string): Promise<DocumentType<UserModel>> {
		const user = await this.userModel.findOne({ email }).exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return user
	}

	async findUserByConfirmEmailToken(
		emailConfirmationToken: string
	): Promise<DocumentType<UserModel>> {
		const user = await this.userModel.findOne({ emailConfirmationToken }).exec()
		if (!user) {
			throw new HttpException(FILED_EMAIL_CONFIRMATION_TOKEN, HttpStatus.NOT_FOUND)
		}
		return user
	}

	async findUserByResetPasswordToken(
		resetPasswordToken: string
	): Promise<DocumentType<UserModel>> {
		const user = await this.userModel
			.findOne({
				resetPasswordToken
			})
			.exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return user
	}

	async find(dto: FindUserDto): Promise<FullListResponse<DocumentType<UserModel>>> {
		const { limit, offset, search, ...otherQueryParams } = dto
		let query: FilterQuery<DocumentType<UserModel>> = { ...otherQueryParams }

		// If the search parameter is provided, add conditions for full-text search
		if (search) {
			query = {
				...query,
				$or: [{ email: new RegExp(search, 'i') }, { displayName: new RegExp(search, 'i') }]
			}
		}

		const total = await this.userModel.countDocuments(query).exec()
		const items = total ? await this.userModel.find(query).skip(offset).limit(limit).exec() : []
		return { items, meta: { total, limit, offset } }
	}

	async deleteById(id: string): Promise<{ message: string }> {
		const isLastAdmin = await this.isLastAdminUser(id)
		if (isLastAdmin) {
			throw new HttpException(FORBIDDEN_TO_DELETE_LAST_ADMIN, HttpStatus.FORBIDDEN)
		}
		const deletedUser = await this.userModel.findOneAndDelete({ _id: id }).exec()
		if (!deletedUser) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return { message: USER_DELETED_MESSAGE }
	}

	async updateById(id: string, dto: UpdateUserDto): Promise<DocumentType<UserModel>> {
		if (dto.role) {
			await this.checkRoleExists(dto.role)
		}
		const isLastAdmin = await this.isLastAdminUser(id)
		if (
			isLastAdmin &&
			(dto.role !== this.configService.get('roles.admin') ||
				dto.isActive === false ||
				dto.email)
		) {
			throw new HttpException(FORBIDDEN_TO_CHANGE_LAST_ADMIN_FIELD, HttpStatus.FORBIDDEN)
		}
		const user = await this.getUserWithPasswordHash(dto)
		let updatedUserDate = { ...user, emailConfirmationToken: null }
		if (dto.email) {
			const emailConfirmationToken = await this.confirmEmailHandler(user.email)
			updatedUserDate = { ...user, isActive: false, emailConfirmationToken }
		}
		const updatedUser = await this.userModel
			.findOneAndUpdate({ _id: id }, updatedUserDate, { new: true })
			.exec()
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.NOT_FOUND)
		}
		return updatedUser
	}

	async updateResetPasswordTokenById(
		id: string,
		resetPasswordToken: Nullable<string>
	): Promise<DocumentType<UserModel> | HttpException> {
		const updatedUser = await this.userModel.findOneAndUpdate(
			{ _id: id },
			{ resetPasswordToken },
			{ new: true }
		)
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.NOT_FOUND)
		}
		return updatedUser
	}

	async changePassword(dto: LoginDto): Promise<DocumentType<UserModel>> {
		const isUser = await this.userExists(dto.email)
		if (!isUser) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		const passwordHash = await this.passwordService.hashPassword(dto.password)
		const updatedUser = await this.userModel
			.findOneAndUpdate({ email: dto.email }, { passwordHash }, { new: true })
			.exec()
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.NOT_FOUND)
		}
		return updatedUser
	}

	async authUpdate(id: string, dto: UpdateUserDto): Promise<TokensResponse> {
		const user = await this.findUserById(id)
		const isLastAdmin = await this.isLastAdminUser(id)
		if (isLastAdmin && dto.email) {
			throw new HttpException(FORBIDDEN_TO_CHANGE_LAST_ADMIN_FIELD, HttpStatus.FORBIDDEN)
		}
		const isPasswordSuccess = await this.passwordService.comparePassword(
			dto.password,
			user.passwordHash
		)
		if (!isPasswordSuccess) {
			throw new HttpException(FILED_PASSWORD_COMPARE, HttpStatus.FORBIDDEN)
		}
		let userData = { ...dto, emailConfirmationToken: null }
		if (dto.email) {
			const emailConfirmationToken = await this.confirmEmailHandler(dto.email)
			userData = { ...dto, isActive: false, emailConfirmationToken }
		}
		delete userData.password
		const updatedUser = await this.userModel
			.findOneAndUpdate({ _id: id }, { ...userData }, { new: true })
			.exec()
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.NOT_FOUND)
		}
		return this.tokenService.createTokens(updatedUser)
	}

	async authDelete(id: string, dto: DeleteDto): Promise<{ message: string }> {
		const validatedUser = await this.validateUser(dto.email, dto.password)
		if (validatedUser._id.toString() !== id) {
			throw new HttpException(FORBIDDEN_TO_DELETE_NOT_SELF_ACCOUNT, HttpStatus.FORBIDDEN)
		}
		return this.deleteById(id)
	}
}
