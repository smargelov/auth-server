import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RoleModel } from './role.model'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import {
	DEFAULT_ROLE_CAN_NOT_BE_DELETED,
	DEFAULT_ROLE_CAN_NOT_BE_UPDATED,
	ROLE_ALREADY_EXISTS,
	ROLE_DELETED_MESSAGE,
	ROLE_NOT_FOUND
} from './role.constants'
import { InitializeRoleDto } from './dto/initialize-role.dto'

@Injectable()
export class RoleService {
	constructor(@InjectModel(RoleModel) private readonly roleModel: ModelType<RoleModel>) {}

	async roleExists(code: CreateRoleDto['code']): Promise<boolean> {
		const role = await this.roleModel.findOne({ code }).exec()
		return !!role
	}

	async create(dto: CreateRoleDto): Promise<DocumentType<RoleModel> | HttpException> {
		const roleExists = await this.roleExists(dto.code)
		if (roleExists) {
			throw new HttpException(ROLE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST)
		}
		dto.isDefault = false
		return this.roleModel.create(dto)
	}

	async initialize(dto: InitializeRoleDto): Promise<boolean> {
		const roleExists = await this.roleExists(dto.code)
		if (roleExists) {
			console.log(`Role with code ${dto.code} already exists`)
			return true
		}
		return !!this.roleModel.create(dto)
	}

	async list(): Promise<DocumentType<RoleModel>[]> {
		return this.roleModel.find().exec()
	}

	async findByCode(
		code: CreateRoleDto['code']
	): Promise<DocumentType<RoleModel> | HttpException> {
		const role = await this.roleModel.findOne({ code }).exec()
		if (!role) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return role
	}

	async deleteByCode(code: CreateRoleDto['code']): Promise<{ message: string } | HttpException> {
		const deletedRole = await this.roleModel.findOneAndDelete({ code }).exec()
		if (!deletedRole) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		if (deletedRole.isDefault) {
			throw new HttpException(DEFAULT_ROLE_CAN_NOT_BE_DELETED, HttpStatus.BAD_REQUEST)
		}
		return { message: ROLE_DELETED_MESSAGE }
	}

	async updateByCode(
		code: CreateRoleDto['code'],
		dto: UpdateRoleDto
	): Promise<DocumentType<RoleModel> | HttpException> {
		const updatedRole = await this.roleModel
			.findOneAndUpdate({ code }, dto, { new: true })
			.exec()
		if (!updatedRole) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		if (updatedRole.isDefault) {
			throw new HttpException(DEFAULT_ROLE_CAN_NOT_BE_UPDATED, HttpStatus.BAD_REQUEST)
		}
		return updatedRole
	}
}
