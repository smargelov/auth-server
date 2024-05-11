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
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { CleanResponseInterceptor } from '../common/interceptors/clean-response.interceptor'
import { UpdateUserDto } from './dto/update-user.dto'

@UsePipes(new ValidationPipe())
@UseInterceptors(CleanResponseInterceptor)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto)
	}

	@Get()
	async list() {
		return this.userService.list()
	}

	@Get(':email')
	async getByEmail(@Param('email') email: CreateUserDto['email']) {
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
