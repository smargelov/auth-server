import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { TokensResponse } from './responses/tokens.response'
import {
	AUTH_REFRESH_TOKEN_EXPIRED_OR_INVALID,
	AUTH_VALIDATE_ERROR_MESSAGE
} from './auth.constants'
import { UserModel } from '../user/user.model'

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}

	private async createTokens(user: DocumentType<UserModel>): Promise<TokensResponse> {
		const accessPayload = {
			id: user._id.toString(),
			role: user.role,
			email: user.email,
			displayName: user.displayName,
			isActive: user.isActive
		}
		const refreshPayload = { id: user._id.toString() }
		return {
			accessToken: this.jwtService.sign(accessPayload),
			refreshToken: this.jwtService.sign(refreshPayload, {
				expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn')
			})
		}
	}

	async login(user: LoginDto): Promise<TokensResponse | HttpException> {
		const validatedUser = await this.userService.validateUser(user.email, user.password)
		if (validatedUser instanceof HttpException) {
			throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.NOT_FOUND)
		}
		return this.createTokens(validatedUser)
	}

	async refresh(refreshToken: string): Promise<TokensResponse | HttpException> {
		try {
			const decoded = this.jwtService.verify<{ id: string }>(refreshToken)

			const user = await this.userService.findUserById(decoded.id)
			if (user instanceof HttpException) {
				throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.UNAUTHORIZED)
			}

			return this.createTokens(user)
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
}