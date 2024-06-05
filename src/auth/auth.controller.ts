import {
	Body,
	Controller,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Res,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { AUTH_NO_REFRESH_TOKEN } from './auth.constants'
import { GetResetPasswordLinkDto } from './dto/get-reset-password-link.dto'
import { CookieService } from '../cookie/cookie.service'

@UsePipes(new ValidationPipe())
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookieService: CookieService
	) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const tokens = await this.authService.login(dto)
		if (tokens instanceof HttpException) {
			throw tokens
		}
		await this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken)

		return { accessToken: tokens.accessToken }
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Res({ passthrough: true }) response: Response) {
		const refreshToken = response.req.cookies['refreshToken']
		if (!refreshToken) {
			throw new HttpException(AUTH_NO_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED)
		}
		const tokens = await this.authService.refresh(refreshToken)
		if (tokens instanceof HttpException) {
			throw tokens
		}
		await this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}

	@Post('get-reset-password-link')
	@HttpCode(HttpStatus.OK)
	async getResetPasswordLink(@Body() dto: GetResetPasswordLinkDto) {
		const result = await this.authService.getResetPasswordLink(dto.email)
		if (result instanceof HttpException) {
			throw result
		}
		return result
	}

	// todo add change password endpoint
}
