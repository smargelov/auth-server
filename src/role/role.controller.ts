import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { CleanResponseInterceptor } from '../common/interceptors/clean-response.interceptor'
import { ValidateObjectIdPipe } from '../common/pipes/validate-object-id.pipe'
import { ROLE_NOT_FOUND } from './role.constants'
import { Roles } from '../common/decorators/roles.decorator'
import { RoleGuard } from '../common/guards/role.guard'
import { ActiveGuard } from '../common/guards/active.guard'

@UsePipes(new ValidationPipe(), new ValidateObjectIdPipe(ROLE_NOT_FOUND))
@UseInterceptors(CleanResponseInterceptor)
@Controller('roles')
@Roles('admin')
@UseGuards(RoleGuard, ActiveGuard)
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

	@Get(':id')
	async getByCode(@Param('id') id: string) {
		return await this.roleService.findById(id)
	}

	@Delete(':id')
	async delete(@Param('id') id: string) {
		return await this.roleService.deleteById(id)
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
		return await this.roleService.updateById(id, dto)
	}
}
