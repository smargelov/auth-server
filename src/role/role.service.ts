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

	async create(dto: CreateRoleDto): Promise<DocumentType<RoleModel>> {
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

	async findById(id: string): Promise<DocumentType<RoleModel>> {
		const role = await this.roleModel.findById(id).exec()
		if (!role) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return role
	}

	async deleteById(id: string): Promise<{ message: string }> {
		const candidate = await this.roleModel.findById(id).exec()
		if (!candidate) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		if (candidate.isDefault) {
			throw new HttpException(DEFAULT_ROLE_CAN_NOT_BE_DELETED, HttpStatus.BAD_REQUEST)
		}
		await this.roleModel.findOneAndDelete({ _id: id }).exec()
		return { message: ROLE_DELETED_MESSAGE }
	}

	async updateById(id: string, dto: UpdateRoleDto): Promise<DocumentType<RoleModel>> {
		const candidate = await this.roleModel.findById(id).exec()
		if (!candidate) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		if (candidate.isDefault) {
			throw new HttpException(DEFAULT_ROLE_CAN_NOT_BE_UPDATED, HttpStatus.BAD_REQUEST)
		}
		return this.roleModel.findOneAndUpdate({ _id: id }, dto, { new: true }).exec()
	}
}
