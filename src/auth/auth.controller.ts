import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	HttpException,
	Post,
	Res,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { AUTH_NO_REFRESH_TOKEN } from './auth.constants'

@UsePipes(new ValidationPipe())
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	private async setRefreshTokenCookie(response: Response, refreshToken: string) {
		response.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000
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
}
