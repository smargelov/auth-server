import { HttpException, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { UserModel } from '../user/user.model'
import type { DocumentType } from '@typegoose/typegoose/lib/types'

@Injectable()
export class LinkService {
	constructor(private readonly userService: UserService) {}

	async confirmEmail(token: string): Promise<DocumentType<UserModel> | HttpException> {
		const user = await this.userService.findUserByConfirmEmailToken(token)
		if (user instanceof HttpException) {
			throw user
		}
		const confirmedUser = await this.userService.updateById(user._id.toString(), {
			isActive: true,
			emailConfirmationToken: null
		})
		if (confirmedUser instanceof HttpException) {
			throw confirmedUser
		}
		return confirmedUser
	}

	async setCanChangePassword(token: string): Promise<UserModel | HttpException> {
		const user = await this.userService.findUserByResetPasswordToken(token)
		if (user instanceof HttpException) {
			throw user
		}
		const updatedUser = await this.userService.updateResetPasswordTokenById(
			user._id.toString(),
			null
		)
		if (updatedUser instanceof HttpException) {
			throw updatedUser
		}
		return updatedUser
	}
}
