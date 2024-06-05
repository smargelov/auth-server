import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import * as ms from 'ms'

@Injectable()
export class CookieService {
	constructor(private readonly configService: ConfigService) {}

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
}
