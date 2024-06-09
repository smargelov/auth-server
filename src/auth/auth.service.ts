import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { TokensResponse } from './responses/tokens.response'
import {
	AUTH_REFRESH_TOKEN_EXPIRED_OR_INVALID,
	AUTH_VALIDATE_ERROR_MESSAGE,
	RESET_PASSWORD_LINK_SENT
} from './auth.constants'
import { UserModel } from '../user/user.model'
import { RegisterDto } from './dto/register.dto'
import { TokenService } from '../token/token.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService
	) {}

	async login(user: LoginDto): Promise<TokensResponse | HttpException> {
		const validatedUser = await this.userService.validateUser(user.email, user.password)
		if (validatedUser instanceof HttpException) {
			throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.NOT_FOUND)
		}
		return this.tokenService.createTokens(validatedUser)
	}

	async refresh(refreshToken: string): Promise<TokensResponse | HttpException> {
		try {
			const decoded = this.jwtService.verify<{ id: string }>(refreshToken)

			const user = await this.userService.findUserById(decoded.id)
			if (user instanceof HttpException) {
				throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.UNAUTHORIZED)
			}

			return this.tokenService.createTokens(user)
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				throw new HttpException(
					AUTH_REFRESH_TOKEN_EXPIRED_OR_INVALID,
					HttpStatus.UNAUTHORIZED
				)
			}
			throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.UNAUTHORIZED)
		}
	}

	async getResetPasswordLink(email: string): Promise<{ message: string } | HttpException> {
		const user = await this.userService.findUserByEmail(email)
		if (user instanceof HttpException) {
			throw user
		}
		const resetPasswordToken = await this.userService.resetPasswordHandler(user.email)
		await this.userService.updateResetPasswordTokenById(user._id.toString(), resetPasswordToken)

		return { message: RESET_PASSWORD_LINK_SENT }
	}

	async register(dto: RegisterDto): Promise<TokensResponse | HttpException> {
		const user = await this.userService.create(dto)
		if (user instanceof HttpException) {
			throw user
		}
		return this.tokenService.createTokens(user)
	}
}
