import { Controller, Get, HttpException, HttpStatus, Query, Redirect, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller()
export class MailController {
	constructor(private readonly configService: ConfigService) {}

	@Get('confirm-email')
	@Redirect()
	async confirmEmail(@Query('token') token: string, @Res() res: Response) {
		try {
			const frontendUrl = this.configService.get<string>('app.frontendUrl')
			return { url: `${frontendUrl}/email-confirmed?token=${token}` }
		} catch (error) {
			throw new HttpException('Email confirmation failed', HttpStatus.BAD_REQUEST)
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
