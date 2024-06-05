import { HttpException, Injectable } from '@nestjs/common'
import { MailService } from '../mail/mail.service'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../user/user.service'
import { UserModel } from '../user/user.model'

@Injectable()
export class LinkService {
	constructor(private readonly userService: UserService) {}

	async confirmEmail(token: string): Promise<UserModel | HttpException> {
		const user = await this.userService.findUserByConfirmEmailToken(token)
		if (user instanceof HttpException) {
			throw user
		}
		const confirmedUser = await this.userService.updateById(user._id.toString(), {
			isConfirmedEmail: true,
			emailConfirmationToken: null
		})
		if (confirmedUser instanceof HttpException) {
			throw confirmedUser
		}
		return confirmedUser
	}
}
