import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { ACCESS_DENIED, TOKEN_EXPIRED_OR_INVALID } from '../common/constants/common.constants'
import { UserModel } from '../user/user.model'
import { TokensResponse } from '../auth/responses/tokens.response'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
	[key: string]: string | number | boolean
}

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async createTokens(user: DocumentType<UserModel>): Promise<TokensResponse> {
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

	handleTokenError(err: unknown): void {
		if (err instanceof TokenExpiredError) {
			throw new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
		}
		throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
	}

	verifyToken<T extends JwtPayload>(token: string): T {
		try {
			return this.jwtService.verify<T>(token)
		} catch (err) {
			this.handleTokenError(err)
		}
	}

	extractToken(authorization: string): string {
		const parts = authorization.split(' ')
		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			throw new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
		}
		return parts[1]
	}

	getIdFromRefreshToken(refreshToken: string): string {
		const decoded = this.jwtService.verify<{ id: string }>(refreshToken)
		if (!decoded.id) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}
		return decoded.id
	}
}
