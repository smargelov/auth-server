import {
	Body,
	Controller,
	HttpCode,
	HttpException,
	HttpStatus,
	Patch,
	Post,
	Res,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import {
	AUTH_NO_REFRESH_TOKEN,
	PASSWORD_CHANGED_NOT_ALLOWED,
	PASSWORD_CHANGED_SUCCESSFULLY
} from './auth.constants'
import { GetResetPasswordLinkDto } from './dto/get-reset-password-link.dto'
import { CookieService } from '../cookie/cookie.service'
import { UserService } from '../user/user.service'
import { TokensResponse } from './responses/tokens.response'
import { RegisterDto } from './dto/register.dto'
import { TokenService } from '../token/token.service'
import { UpdateDto } from './dto/update.dto'

@UsePipes(new ValidationPipe())
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookieService: CookieService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService
	) {}

	private async tokensHandler(tokens: TokensResponse | HttpException, response: Response) {
		if (tokens instanceof HttpException) {
			throw tokens
		}
		await this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}

	private async getRefreshTokenFromCookie(response: Response) {
		const refreshToken = response.req.cookies['refreshToken']
		if (!refreshToken) {
			throw new HttpException(AUTH_NO_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED)
		}
		return refreshToken
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const tokens = await this.authService.login(dto)
		return this.tokensHandler(tokens, response)
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Res({ passthrough: true }) response: Response) {
		const refreshToken = await this.getRefreshTokenFromCookie(response)
		const tokens = await this.authService.refresh(refreshToken)
		return this.tokensHandler(tokens, response)
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

	@Patch('change-password')
	async changePassword(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const cookieEmail = response.req.cookies['canChangePasswordForEmail']
		if (!cookieEmail || cookieEmail !== dto.email) {
			throw new HttpException(PASSWORD_CHANGED_NOT_ALLOWED, HttpStatus.BAD_REQUEST)
		}
		const result = await this.userService.changePassword(dto)
		if (result instanceof HttpException) {
			throw result
		}
		const tokens = await this.tokenService.createTokens(result)
		const answer = await this.tokensHandler(tokens, response)
		response.clearCookie('canChangePasswordForEmail')
		return { ...answer, message: PASSWORD_CHANGED_SUCCESSFULLY }
	}

	@Post('register')
	async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
		const tokens = await this.authService.register(dto)
		return this.tokensHandler(tokens, response)
	}

	@Patch('update')
	async update(@Body() dto: UpdateDto, @Res({ passthrough: true }) response: Response) {
		const refreshToken = await this.getRefreshTokenFromCookie(response)
		const id = this.tokenService.getIdFromRefreshToken(refreshToken)
		const tokens = await this.userService.authUpdate(id, dto)
		return this.tokensHandler(tokens, response)
	}
}
