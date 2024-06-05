import { Controller, Get, HttpException, Query, Redirect, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LinkService } from './link.service'
import { Response } from 'express'
import { CookieService } from '../cookie/cookie.service'
import { AuthService } from '../auth/auth.service'

@Controller()
export class LinkController {
	constructor(
		private readonly linkService: LinkService,
		private readonly cookieService: CookieService,
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Get('confirm-email')
	@Redirect()
	async confirmEmail(
		@Query('token') token: string,
		@Res({ passthrough: true }) response: Response
	) {
		const frontendUrl = this.configService.get<string>('app.frontendUrl')
		try {
			await this.linkService.confirmEmail(token)
			return { url: `${frontendUrl}/email-confirmed?success` }
		} catch (error) {
			if (error instanceof HttpException) {
				return { url: `${frontendUrl}/email-confirmed?error=${error.message}` }
			}
		}
	}

	@Get('reset-password')
	@Redirect()
	async resetPassword(
		@Query('token') token: string,
		@Res({ passthrough: true }) response: Response
	) {
		const frontendUrl = this.configService.get<string>('app.frontendUrl')
		try {
			const user = await this.linkService.setCanChangePassword(token)
			if (user instanceof HttpException) {
				throw user
			}
			await this.cookieService.setCanChangePasswordCookie(response, user.email)
			return { url: `${frontendUrl}/change-password?success` }
		} catch (error) {
			response.clearCookie('canChangePassword')
			if (error instanceof HttpException) {
				return { url: `${frontendUrl}/change-password?error=${error.message}` }
			}
		}
	}
}
