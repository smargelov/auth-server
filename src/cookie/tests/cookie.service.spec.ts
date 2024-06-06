import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import * as ms from 'ms'
import { CookieService } from '../cookie.service'

describe('CookieService', () => {
	let cookieService: CookieService
	let configService: ConfigService
	let response: Response

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CookieService,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn()
					}
				}
			]
		}).compile()

		cookieService = module.get<CookieService>(CookieService)
		configService = module.get<ConfigService>(ConfigService)
		response = {
			cookie: jest.fn()
		} as unknown as Response
	})

	describe('setCanChangePasswordCookie', () => {
		it('should set canChangePasswordForEmail cookie correctly', async () => {
			const canChangePasswordForEmail = 'test@example.com'
			const maxAge = ms('1h')

			await cookieService.setCanChangePasswordCookie(response, canChangePasswordForEmail)

			expect(response.cookie).toHaveBeenCalledWith(
				'canChangePasswordForEmail',
				canChangePasswordForEmail,
				{
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge
				}
			)
		})
	})

	describe('setRefreshTokenCookie', () => {
		it('should set refreshToken cookie correctly', async () => {
			const refreshToken = 'some-refresh-token'
			const refreshTokenExpiresIn = '7d'
			jest.spyOn(configService, 'get').mockReturnValue(refreshTokenExpiresIn)
			const maxAge = ms(refreshTokenExpiresIn)

			await cookieService.setRefreshTokenCookie(response, refreshToken)

			expect(response.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge
			})
		})
	})
})
