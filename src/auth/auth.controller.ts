import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	HttpException,
	Post,
	Res,
	UsePipes,
	ValidationPipe,
	Get,
	Redirect,
	Query
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

	@Get('confirm-email')
	@Redirect()
	async confirmEmail(@Query('token') token: string, @Res() res: Response) {
		try {
			const frontendUrl = this.configService.get<string>('app.frontendUrl')
			return { url: `${frontendUrl}/email-confirmed?token=${token}` }
		} catch (error) {
			throw new HttpException('Email confirmation failed', HttpStatus.BAD_REQUEST)
		}
	}

	@Get('reset-password')
	@Redirect()
	async resetPassword(@Query('token') token: string, @Res() res: Response) {
		const frontendUrl = this.configService.get<string>('app.frontendUrl')
		try {
			const frontendUrl = this.configService.get<string>('app.frontendUrl')
			return { url: `${frontendUrl}/reset-password?token=${token}` }
		} catch (error) {
			throw new HttpException('Password reset failed', HttpStatus.BAD_REQUEST)
		}
	}
}
