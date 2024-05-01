import { Injectable } from '@nestjs/common'
import { RoleModel } from './role.model'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RoleService {
	constructor(@InjectModel(RoleModel) private readonly roleModel: ModelType<RoleModel>) {}

	async create(dto: CreateRoleDto): Promise<DocumentType<RoleModel>> {
		return this.roleModel.create(dto)
	}

	async findByCode(code: string): Promise<DocumentType<RoleModel> | null> {
		return this.roleModel.findOne({ code }).exec()
	}

	async list(): Promise<DocumentType<RoleModel>[]> {
		return this.roleModel.find().exec()
	}

	async deleteByCode(code: string): Promise<DocumentType<RoleModel> | null> {
		return this.roleModel.findOneAndDelete({ code }).exec()
	}

	async updateByCode(code: string, dto: UpdateRoleDto): Promise<DocumentType<RoleModel>> {
		return this.roleModel.findOneAndUpdate({ code }, dto, { new: true }).exec()
	}
}
