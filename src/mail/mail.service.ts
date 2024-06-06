import { MailerService } from '@nestjs-modules/mailer'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ERROR_SENDING_EMAIL } from './mail.constants'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	private checkBaseUrlAndBrand(): { baseUrl: string; brand: string } | false {
		const baseUrl = this.configService.get<string>('app.baseUrl')
		const brand = this.configService.get<string>('app.brand')
		if (!baseUrl || !brand) {
			return false
		}
		return { baseUrl, brand }
	}

	async sendConfirmEmail(email: string, token: string): Promise<boolean | HttpException> {
		try {
			const result = this.checkBaseUrlAndBrand()
			if (!result) {
				throw new Error()
			}
			const { baseUrl, brand } = result
			const confirmationUrl = `${baseUrl}/confirm-email?token=${token}`

			await this.mailerService.sendMail({
				to: email,
				subject: `${brand} | Confirm your email`,
				template: './confirmation',
				context: {
					confirmationUrl
				}
			})
			return true
		} catch (e) {
			throw new HttpException(ERROR_SENDING_EMAIL, HttpStatus.BAD_REQUEST)
		}
	}

	async sendResetPassword(email: string, token: string): Promise<boolean | HttpException> {
		try {
			const result = this.checkBaseUrlAndBrand()
			if (!result) {
				throw new Error()
			}
			const { baseUrl, brand } = result
			const resetPasswordUrl = `${baseUrl}/reset-password?token=${token}`

			await this.mailerService.sendMail({
				to: email,
				subject: `${brand} | Reset your password`,
				template: './reset-password',
				context: {
					resetPasswordUrl
				}
			})
			return true
		} catch (e) {
			throw new HttpException(ERROR_SENDING_EMAIL, HttpStatus.BAD_REQUEST)
		}
	}
}
