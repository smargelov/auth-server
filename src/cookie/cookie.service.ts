import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import * as ms from 'ms'
import { AUTH_NO_REFRESH_TOKEN } from '../auth/auth.constants'
import { TokensResponse } from '../auth/responses/tokens.response'

@Injectable()
export class CookieService {
	constructor(private readonly configService: ConfigService) {}

	private getCookieValueByName(response: Response, name: string): string {
		return response.req.cookies[name]
	}

	private clearCookieValueByName(response: Response, name: string): void {
		response.clearCookie(name)
	}

	async getRefreshTokenFromCookie(response: Response) {
		const refreshToken = this.getCookieValueByName(response, 'refreshToken')
		if (!refreshToken) {
			throw new HttpException(AUTH_NO_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED)
		}
		return refreshToken
	}

	async setCanChangePasswordCookie(response: Response, canChangePasswordForEmail: string) {
		const maxAge = ms('1h')

		response.cookie('canChangePasswordForEmail', canChangePasswordForEmail, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge
		})
	}

	async setRefreshTokenCookie(response: Response, refreshToken: string) {
		const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn')
		const maxAge = ms(refreshTokenExpiresIn)

		response.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge
		})
	}

	clearRefreshTokenCookie(response: Response): void {
		this.clearCookieValueByName(response, 'refreshToken')
	}

	async tokensHandler(tokens: TokensResponse | HttpException, response: Response) {
		if (tokens instanceof HttpException) {
			throw tokens
		}
		await this.setRefreshTokenCookie(response, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}

	getCanChangePasswordCookie(response: Response): string {
		return this.getCookieValueByName(response, 'canChangePasswordForEmail')
	}

	clearCanChangePasswordCookie(response: Response): void {
		this.clearCookieValueByName(response, 'canChangePasswordForEmail')
	}
}
