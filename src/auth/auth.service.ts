import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response, Request } from 'express'
import { UserService } from '../user/user.service'
import { TokenService } from '../token/token.service'
import { CookieService } from '../cookie/cookie.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { UpdateDto } from './dto/update.dto'
import { DeleteDto } from './dto/delete.dto'
import {
	PASSWORD_CHANGED_NOT_ALLOWED,
	PASSWORD_CHANGED_SUCCESSFULLY,
	RESET_PASSWORD_LINK_SENT,
	SELF_REMOVAL_IS_PROHIBITED
} from './auth.constants'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly cookieService: CookieService,
		private readonly configService: ConfigService
	) {}

	async login(
		user: LoginDto,
		request: Request,
		response: Response
	): Promise<{
		accessToken: string
		refreshToken?: string
	}> {
		const validatedUser = await this.userService.validateUser(user.email, user.password)
		if (validatedUser instanceof HttpException) {
			this.cookieService.clearRefreshTokenCookie(response)
			throw validatedUser
		}
		const tokens = await this.tokenService.createTokens(validatedUser)
		return this.cookieService.tokensHandler(tokens, request, response)
	}

	async refresh(
		request: Request,
		response: Response
	): Promise<{ accessToken: string; refreshToken?: string }> {
		const refreshToken = this.cookieService.getRefreshTokenFromRequest(request)
		const id = this.tokenService.getIdFromRefreshToken(refreshToken)
		const user = await this.userService.findUserById(id)
		const tokens = await this.tokenService.createTokens(user)
		return this.cookieService.tokensHandler(tokens, request, response)
	}

	async getResetPasswordLink(email: string): Promise<{ message: string }> {
		const user = await this.userService.findUserByEmail(email)
		const resetPasswordToken = await this.userService.resetPasswordHandler(user.email)
		await this.userService.updateResetPasswordTokenById(user._id.toString(), resetPasswordToken)

		return { message: RESET_PASSWORD_LINK_SENT }
	}

	async changePassword(
		dto: LoginDto,
		request: Request,
		response: Response
	): Promise<{
		accessToken: string
		refreshToken?: string
		message: string
	}> {
		const cookieEmail = this.cookieService.getCanChangePasswordCookie(request)
		if (!cookieEmail || cookieEmail !== dto.email) {
			throw new HttpException(PASSWORD_CHANGED_NOT_ALLOWED, HttpStatus.BAD_REQUEST)
		}
		const result = await this.userService.changePassword(dto)
		const tokens = await this.tokenService.createTokens(result)
		const answer = await this.cookieService.tokensHandler(tokens, request, response)
		this.cookieService.clearCanChangePasswordCookie(response)
		return {
			...answer,
			message: PASSWORD_CHANGED_SUCCESSFULLY
		}
	}

	async register(
		dto: RegisterDto,
		request: Request,
		response: Response
	): Promise<{
		accessToken: string
		refreshToken?: string
	}> {
		const user = await this.userService.create(dto)
		const tokens = await this.tokenService.createTokens(user)
		return this.cookieService.tokensHandler(tokens, request, response)
	}

	async update(
		dto: UpdateDto,
		request: Request,
		response: Response
	): Promise<{
		accessToken: string
		refreshToken?: string
	}> {
		const refreshToken = this.cookieService.getRefreshTokenFromRequest(request)
		const id = this.tokenService.getIdFromRefreshToken(refreshToken)
		const tokens = await this.userService.authUpdate(id, dto)
		return this.cookieService.tokensHandler(tokens, request, response)
	}

	async deleteAccount(
		dto: DeleteDto,
		request: Request,
		response: Response
	): Promise<{ message: string }> {
		if (!this.configService.get('settings.can.deleteSelfAccount')) {
			throw new HttpException(SELF_REMOVAL_IS_PROHIBITED, HttpStatus.FORBIDDEN)
		}
		this.cookieService.clearRefreshTokenCookie(response)
		const refreshToken = this.cookieService.getRefreshTokenFromRequest(request)
		const id = this.tokenService.getIdFromRefreshToken(refreshToken)
		return this.userService.authDelete(id, dto)
	}
}
