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

@UsePipes(new ValidationPipe())
@UseInterceptors(CleanResponseInterceptor)
@UseInterceptors(HidePasswordInterceptor)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async create(
		@Body() createUserDto: CreateUserDto
	): Promise<DocumentType<UserModel> | HttpException> {
		return this.userService.create(createUserDto)
	}

	@Get()
	async find(
		@Query(new ValidationPipe({ transform: true }))
		query: FindUserDto
	) {
		return this.userService.find(query)
	}

	@Get(':email')
	async getOne(@Param('email') email: CreateUserDto['email']) {
		return await this.userService.findUserByEmail(email)
	}

	@Delete(':email')
	async delete(@Param('email') email: CreateUserDto['email']) {
		return await this.userService.deleteByEmail(email)
	}

	@Patch(':email')
	async update(@Param('email') email: CreateUserDto['email'], @Body() dto: UpdateUserDto) {
		return await this.userService.updateByEmail(email, dto)
	}
}
