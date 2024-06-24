import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	Param,
	Patch,
	Post,
	Query,
	UseFilters,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import type { DocumentType } from '@typegoose/typegoose/lib/types'

import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { FindUserDto } from './dto/find-user.dto'
import { CleanResponseInterceptor } from '../common/interceptors/clean-response.interceptor'
import { HidePasswordInterceptor } from '../common/interceptors/hide-password.interceptor'
import { UserModel } from './user.model'
import { ValidateObjectIdPipe } from '../common/pipes/validate-object-id.pipe'
import { USER_NOT_FOUND } from './user.constants'
import { Module } from '../common/decorators/module.decorator'
import { RoleGuard } from '../common/guards/role.guard'
import { ActiveGuard } from '../common/guards/active.guard'
import { HttpExceptionFilter } from '../common/filters/http-exception.filter'

@UsePipes(new ValidationPipe(), new ValidateObjectIdPipe(USER_NOT_FOUND))
@UseInterceptors(CleanResponseInterceptor)
@UseInterceptors(HidePasswordInterceptor)
@UseFilters(new HttpExceptionFilter())
@Controller('users')
@Module('user')
@UseGuards(RoleGuard, ActiveGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto)
	}

	@Get()
	async find(
		@Query(new ValidationPipe({ transform: true }))
		query: FindUserDto
	) {
		return this.userService.find(query)
	}

	@Get(':id')
	async getOne(@Param('id') id: string) {
		return this.userService.findUserById(id)
	}

	@Delete(':id')
	async delete(@Param('id') id: string) {
		return this.userService.deleteById(id)
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateById(id, dto)
	}
}
