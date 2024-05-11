import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from './user.model'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { RoleService } from '../role/role.service'
import {
	FAILED_TO_CREATE_USER,
	FAILED_TO_UPDATE_USER,
	USER_ALREADY_EXISTS,
	USER_DELETED_MESSAGE,
	USER_NOT_FOUND
} from './user.constants'
import { ROLE_NOT_FOUND } from '../role/role.constants'
import { UpdateUserDto } from './dto/update-user.dto'
import { PasswordService } from './password.service'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
		private readonly roleService: RoleService,
		private readonly passwordService: PasswordService
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

	async create(dto: CreateUserDto): Promise<DocumentType<UserModel> | HttpException> {
		await this.checkRoleExists(dto.role)
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

	async findUserByEmail(
		email: CreateUserDto['email']
	): Promise<DocumentType<UserModel> | HttpException> {
		const user = await this.userModel.findOne({ email }).exec()
		if (!user) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return user
	}

	async list(): Promise<DocumentType<UserModel>[]> {
		return this.userModel.find().exec()
	}

	async deleteByEmail(
		email: CreateUserDto['email']
	): Promise<{ message: string } | HttpException> {
		const deletedUser = await this.userModel.findOneAndDelete({ email }).exec()
		if (!deletedUser) {
			throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return { message: USER_DELETED_MESSAGE }
	}

	async updateByEmail(
		email: CreateUserDto['email'],
		dto: UpdateUserDto
	): Promise<DocumentType<UserModel> | HttpException> {
		if (dto.role) {
			await this.checkRoleExists(dto.role)
		}
		const user = await this.getUserWithPasswordHash(dto)
		const updatedUser = await this.userModel
			.findOneAndUpdate({ email }, user, { new: true })
			.exec()
		if (!updatedUser) {
			throw new HttpException(FAILED_TO_UPDATE_USER, HttpStatus.INTERNAL_SERVER_ERROR)
		}
		return updatedUser
	}
}
