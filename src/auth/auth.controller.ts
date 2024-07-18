import {
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Res,
	Req,
	UseFilters,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { GetResetPasswordLinkDto } from './dto/get-reset-password-link.dto'
import { RegisterDto } from './dto/register.dto'
import { UpdateDto } from './dto/update.dto'
import { DeleteDto } from './dto/delete.dto'
import { HttpExceptionFilter } from '../common/filters/http-exception.filter'

@UsePipes(new ValidationPipe())
@UseFilters(new HttpExceptionFilter())
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() dto: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		return this.authService.login(dto, request, response)
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		return this.authService.refresh(request, response)
	}

	@Post('get-reset-password-link')
	@HttpCode(HttpStatus.OK)
	async getResetPasswordLink(@Body() dto: GetResetPasswordLinkDto) {
		return this.authService.getResetPasswordLink(dto.email)
	}

	@Patch('change-password')
	async changePassword(
		@Body() dto: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		return this.authService.changePassword(dto, request, response)
	}

	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		return this.authService.register(dto, request, response)
	}

	@Patch('update')
	async update(
		@Body() dto: UpdateDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		return this.authService.update(dto, request, response)
	}

	@Delete('delete-account')
	async delete(
		@Body() dto: DeleteDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		return this.authService.deleteAccount(dto, request, response)
	}
}
