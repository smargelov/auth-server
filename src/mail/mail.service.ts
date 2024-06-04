import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendConfirmEmail(email: string, token: string) {
		try {
			const baseUrl = this.configService.get<string>('app.baseUrl')
			const brand = this.configService.get<string>('app.brand')
			if (!baseUrl || !brand) {
				return false
			}
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
			return false
		}
	}
}
