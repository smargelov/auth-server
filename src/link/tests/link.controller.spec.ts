import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { HttpException } from '@nestjs/common'
import { Response } from 'express'
import { LinkController } from '../link.controller'
import { LinkService } from '../link.service'
import { CookieService } from '../../cookie/cookie.service'

describe('LinkController', () => {
	let linkController: LinkController
	let linkService: LinkService
	let cookieService: CookieService
	let configService: ConfigService
	let response: Response

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [LinkController],
			providers: [
				{
					provide: LinkService,
					useValue: {
						confirmEmail: jest.fn(),
						setCanChangePassword: jest.fn()
					}
				},
				{
					provide: CookieService,
					useValue: {
						setCanChangePasswordCookie: jest.fn()
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('http://frontend.url')
					}
				}
			]
		}).compile()

		linkController = module.get<LinkController>(LinkController)
		linkService = module.get<LinkService>(LinkService)
		cookieService = module.get<CookieService>(CookieService)
		configService = module.get<ConfigService>(ConfigService)
		response = {
			clearCookie: jest.fn()
		} as unknown as Response
	})

	describe('confirmEmail', () => {
		it('should return success URL when email is confirmed', async () => {
			jest.spyOn(linkService, 'confirmEmail').mockResolvedValue(undefined)

			const result = await linkController.confirmEmail('token', response)

			expect(result).toEqual({ url: 'http://frontend.url/email-confirmed?success' })
			expect(linkService.confirmEmail).toHaveBeenCalledWith('token')
		})

		it('should return error URL when HttpException is thrown', async () => {
			const error = new HttpException('error message', 400)
			jest.spyOn(linkService, 'confirmEmail').mockRejectedValue(error)

			const result = await linkController.confirmEmail('token', response)

			expect(result).toEqual({
				url: 'http://frontend.url/email-confirmed?error=error message'
			})
		})
	})

	describe('resetPassword', () => {
		it('should set cookie and return success URL when password can be changed', async () => {
			const user = {
				email: 'test@example.com',
				role: 'user',
				isActive: true,
				isConfirmedEmail: true,
				passwordHash: 'hashedpassword'
			}
			jest.spyOn(linkService, 'setCanChangePassword').mockResolvedValue(user)

			const result = await linkController.resetPassword('token', response)

			expect(result).toEqual({ url: 'http://frontend.url/change-password?success' })
			expect(linkService.setCanChangePassword).toHaveBeenCalledWith('token')
			expect(cookieService.setCanChangePasswordCookie).toHaveBeenCalledWith(
				response,
				'test@example.com'
			)
		})

		it('should clear cookie and return error URL when HttpException is thrown', async () => {
			const error = new HttpException('error message', 400)
			jest.spyOn(linkService, 'setCanChangePassword').mockRejectedValue(error)

			const result = await linkController.resetPassword('token', response)

			expect(result).toEqual({
				url: 'http://frontend.url/change-password?error=error message'
			})
			expect(response.clearCookie).toHaveBeenCalledWith('canChangePasswordForEmail')
		})
	})
})
