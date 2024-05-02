import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { ROLE_ALREADY_EXISTS, ROLE_DELETED_MESSAGE, ROLE_NOT_FOUND } from './role.constants'
import { UpdateRoleDto } from './dto/update-role.dto'
import { CleanResponseInterceptor } from '../common/interceptors/clean-response.interceptor'

@UsePipes(new ValidationPipe())
@UseInterceptors(CleanResponseInterceptor)
@Controller('roles')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post()
	async create(@Body() createRoleDto: CreateRoleDto) {
		const candidate = await this.roleService.findByCode(createRoleDto.code)
		if (candidate) {
			throw new HttpException(ROLE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST)
		}
		return this.roleService.create(createRoleDto)
	}

	@Get()
	async list() {
		return this.roleService.list()
	}

	@Get(':code')
	async getByCode(@Param('code') code: CreateRoleDto['code']) {
		const searchedRole = await this.roleService.findByCode(code)
		if (!searchedRole) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return searchedRole
	}

	@Delete(':code')
	async delete(@Param('code') code: CreateRoleDto['code']) {
		const deletedRole = await this.roleService.deleteByCode(code)
		if (!deletedRole) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return { message: ROLE_DELETED_MESSAGE }
	}

	@Patch(':code')
	async update(@Param('code') code: CreateRoleDto['code'], @Body() dto: UpdateRoleDto) {
		const updatedRole = await this.roleService.updateByCode(code, dto)
		if (!updatedRole) {
			throw new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
		}
		return updatedRole
	}
}
