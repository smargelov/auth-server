import { Test, TestingModule } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { Types } from 'mongoose'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { LinkService } from '../link.service'
import { UserService } from '../../user/user.service'
import { UserModel } from '../../user/user.model'

describe('LinkService', () => {
	let linkService: LinkService
	let userService: UserService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LinkService,
				{
					provide: UserService,
					useValue: {
						findUserByConfirmEmailToken: jest.fn(),
						updateById: jest.fn(),
						findUserByResetPasswordToken: jest.fn(),
						updateResetPasswordTokenById: jest.fn()
					}
				}
			]
		}).compile()

		linkService = module.get<LinkService>(LinkService)
		userService = module.get<UserService>(UserService)
	})

	describe('confirmEmail', () => {
		it('should confirm email successfully', async () => {
			const user: DocumentType<UserModel> = {
				_id: new Types.ObjectId(),
				email: 'test@example.com',
				role: 'user',
				isActive: true,
				isConfirmedEmail: false,
				passwordHash: 'hashedpassword'
			} as unknown as DocumentType<UserModel>

			jest.spyOn(userService, 'findUserByConfirmEmailToken').mockResolvedValue(user)
			jest.spyOn(userService, 'updateById').mockResolvedValue({
				...user,
				isConfirmedEmail: true,
				emailConfirmationToken: null
			} as unknown as DocumentType<UserModel>)

			const result = await linkService.confirmEmail('validToken')

			expect((result as DocumentType<UserModel>).isConfirmedEmail).toBe(true)
			expect((result as DocumentType<UserModel>).emailConfirmationToken).toBe(null)
		})

		it('should throw HttpException if token is invalid', async () => {
			const error = new HttpException('Invalid token', 400)
			jest.spyOn(userService, 'findUserByConfirmEmailToken').mockRejectedValue(error)

			await expect(linkService.confirmEmail('invalidToken')).rejects.toThrow(HttpException)
		})

		it('should throw HttpException if update fails', async () => {
			const user: DocumentType<UserModel> = {
				_id: new Types.ObjectId(),
				email: 'test@example.com',
				role: 'user',
				isActive: true,
				isConfirmedEmail: false,
				passwordHash: 'hashedpassword'
			} as unknown as DocumentType<UserModel>

			jest.spyOn(userService, 'findUserByConfirmEmailToken').mockResolvedValue(user)
			const error = new HttpException('Update failed', 500)
			jest.spyOn(userService, 'updateById').mockRejectedValue(error)

			await expect(linkService.confirmEmail('validToken')).rejects.toThrow(HttpException)
		})
	})

	describe('setCanChangePassword', () => {
		it('should set can change password successfully', async () => {
			const user: DocumentType<UserModel> = {
				_id: new Types.ObjectId(),
				email: 'test@example.com',
				role: 'user',
				isActive: true,
				isConfirmedEmail: true,
				passwordHash: 'hashedpassword'
			} as unknown as DocumentType<UserModel>

			jest.spyOn(userService, 'findUserByResetPasswordToken').mockResolvedValue(user)
			jest.spyOn(userService, 'updateResetPasswordTokenById').mockResolvedValue({
				...user,
				resetPasswordToken: null
			} as unknown as DocumentType<UserModel>)

			const result = await linkService.setCanChangePassword('validToken')

			expect((result as DocumentType<UserModel>).resetPasswordToken).toBe(null)
		})

		it('should throw HttpException if token is invalid', async () => {
			const error = new HttpException('Invalid token', 400)
			jest.spyOn(userService, 'findUserByResetPasswordToken').mockRejectedValue(error)

			await expect(linkService.setCanChangePassword('invalidToken')).rejects.toThrow(
				HttpException
			)
		})

		it('should throw HttpException if update fails', async () => {
			const user: DocumentType<UserModel> = {
				_id: new Types.ObjectId(),
				email: 'test@example.com',
				role: 'user',
				isActive: true,
				isConfirmedEmail: true,
				passwordHash: 'hashedpassword'
			} as unknown as DocumentType<UserModel>

			jest.spyOn(userService, 'findUserByResetPasswordToken').mockResolvedValue(user)
			const error = new HttpException('Update failed', 500)
			jest.spyOn(userService, 'updateResetPasswordTokenById').mockRejectedValue(error)

			await expect(linkService.setCanChangePassword('validToken')).rejects.toThrow(
				HttpException
			)
		})
	})
})
