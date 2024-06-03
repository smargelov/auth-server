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
	FILED_PASSWORD_COMPARE,
	USER_ALREADY_EXISTS,
	USER_DELETED_MESSAGE,
	USER_NOT_FOUND
} from './user.constants'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
		private readonly roleService: RoleService,
		private readonly passwordService: PasswordService,
		private readonly configService: ConfigService
	) {}

	private async userExists(email: CreateUserDto['email']): Promise<boolean> {
		const user = await this.userModel.findOne({ email }).exec()
		return !!user
	}

	private async getUserWithPasswordHash(dto: CreateUserDto | UpdateUserDto) {
		const { password, ...rest } = dto
		if (!password) {
			return rest
		}
		const passwordHash = await this.passwordService.hashPassword(password)
		return { ...rest, passwordHash }
	}

	private async checkRoleExists(role: CreateUserDto['role']): Promise<boolean | HttpException> {
		const roleExists = await this.roleService.roleExists(role)
		if (!roleExists) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return !!roleExists
	}

	async validateUser(
		email: string,
		password: string
	): Promise<DocumentType<UserModel> | HttpException> {
		const user = await this.userModel.findOne({ email }).exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		const isPasswordSuccess = await this.passwordService.comparePassword(
			password,
			user.passwordHash
		)
		if (!isPasswordSuccess) {
			throw new HttpException(FILED_PASSWORD_COMPARE, HttpStatus.NOT_FOUND)
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
		const createdUser = await this.userModel.create(user)
		if (!createdUser) {
			console.log(`Failed to create user with email ${dto.email}`)
			return false
		}
		return !!createdUser
	}

	async create(dto: CreateUserDto): Promise<DocumentType<UserModel> | HttpException> {
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
		const createdUser = await this.userModel.create(user)
		if (!createdUser) {
			throw new HttpException(FAILED_TO_CREATE_USER, HttpStatus.INTERNAL_SERVER_ERROR)
		}
		return createdUser
	}

	async findUserById(id: string): Promise<DocumentType<UserModel> | HttpException> {
		const user = await this.userModel.findOne({ _id: id }).exec()
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

	async deleteById(id: string): Promise<{ message: string } | HttpException> {
		const deletedUser = await this.userModel.findOneAndDelete({ _id: id }).exec()
		if (!deletedUser) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return { message: USER_DELETED_MESSAGE }
	}

	async updateById(
		id: string,
		dto: UpdateUserDto
	): Promise<DocumentType<UserModel> | HttpException> {
		if (dto.role) {
			await this.checkRoleExists(dto.role)
		}
		const user = await this.getUserWithPasswordHash(dto)
		const updatedUser = await this.userModel
			.findOneAndUpdate({ _id: id }, user, { new: true })
			.exec()
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.NOT_FOUND)
		}
		return updatedUser
	}
}
