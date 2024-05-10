import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { CleanResponseInterceptor } from '../common/interceptors/clean-response.interceptor'

@UsePipes(new ValidationPipe())
@UseInterceptors(CleanResponseInterceptor)
@Controller('roles')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post()
	async create(@Body() createRoleDto: CreateRoleDto) {
		return this.roleService.create(createRoleDto)
	}

	@Get()
	async list() {
		return this.roleService.list()
	}

	@Get(':code')
	async getByCode(@Param('code') code: CreateRoleDto['code']) {
		return await this.roleService.findByCode(code)
	}

	@Delete(':code')
	async delete(@Param('code') code: CreateRoleDto['code']) {
		return await this.roleService.deleteByCode(code)
	}

	@Patch(':code')
	async update(@Param('code') code: CreateRoleDto['code'], @Body() dto: UpdateRoleDto) {
		return await this.roleService.updateByCode(code, dto)
	}
}
