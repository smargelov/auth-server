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
import { ConfigService } from '@nestjs/config'
import * as ms from 'ms'

@UsePipes(new ValidationPipe())
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	private async setRefreshTokenCookie(response: Response, refreshToken: string) {
		const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn')
		const maxAge = ms(refreshTokenExpiresIn)

		response.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge
		})
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const tokens = await this.authService.login(dto)
		if (tokens instanceof HttpException) {
			throw tokens
		}
		await this.setRefreshTokenCookie(response, tokens.refreshToken)

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
		await this.setRefreshTokenCookie(response, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}

	@Post('get-reset-password-link')
	@HttpCode(HttpStatus.OK)
	async getResetPasswordLink(@Body() dto: { email: string }) {
		const result = await this.authService.getResetPasswordLink(dto.email)
		if (result instanceof HttpException) {
			throw result
		}
		return result
	}
}
