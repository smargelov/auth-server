import { Controller, Get, HttpException, HttpStatus, Query, Redirect, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LinkService } from './link.service'

@Controller()
export class LinkController {
	constructor(
		private readonly linkService: LinkService,
		private readonly configService: ConfigService
	) {}

	@Get('confirm-email')
	@Redirect()
	async confirmEmail(@Query('token') token: string, @Res() res: Response) {
		const frontendUrl = this.configService.get<string>('app.frontendUrl')
		try {
			const user = await this.linkService.confirmEmail(token)
			return { url: `${frontendUrl}/email-confirmed?success` }
		} catch (error) {
			if (error instanceof HttpException) {
				return { url: `${frontendUrl}/email-confirmed?error=${error.message}` }
			}
		}
	}

	@Get('reset-password')
	@Redirect()
	async resetPassword(@Query('token') token: string, @Res() res: Response) {
		const frontendUrl = this.configService.get<string>('app.frontendUrl')
		try {
			const frontendUrl = this.configService.get<string>('app.frontendUrl')
			return { url: `${frontendUrl}/reset-password?token=${token}` }
		} catch (error) {
			throw new HttpException('Password reset failed', HttpStatus.BAD_REQUEST)
		}
	}
}
