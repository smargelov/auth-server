import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { TokensResponse } from './responses/tokens.response'
import { ConfigService } from '@nestjs/config'
import { AUTH_VALIDATE_ERROR_MESSAGE } from './auth.constants'
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
			accessToken: this.jwtService.sign(accessPayload, {
				expiresIn: this.configService.get('jwt.accessTokenExpiresIn')
			}),
			refreshToken: this.jwtService.sign(refreshPayload, {
				expiresIn: this.configService.get('jwt.refreshTokenExpiresIn')
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
		const decoded = this.jwtService.decode(refreshToken) as { id: string }
		if (!decoded) {
			throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.UNAUTHORIZED)
		}
		const user = await this.userService.findUserById(decoded.id)
		if (user instanceof HttpException) {
			throw user
		}
		return this.createTokens(user)
	}
}
