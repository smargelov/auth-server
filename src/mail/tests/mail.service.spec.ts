import { Test, TestingModule } from '@nestjs/testing'
import { MailService } from '../mail.service'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { HttpException } from '@nestjs/common'

describe('MailService', () => {
	let mailService: MailService
	let mailerService: MailerService
	let configService: ConfigService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailService,
				{
					provide: MailerService,
					useValue: {
						sendMail: jest.fn().mockResolvedValue(true)
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('test')
					}
				}
			]
		}).compile()

		mailService = module.get<MailService>(MailService)
		mailerService = module.get<MailerService>(MailerService)
		configService = module.get<ConfigService>(ConfigService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(mailService).toBeDefined()
	})

	it('should send confirm email', async () => {
		const result = await mailService.sendConfirmEmail('test@test.com', 'token')

		expect(configService.get).toHaveBeenCalledWith('app.baseUrl')
		expect(configService.get).toHaveBeenCalledWith('app.brand')
		expect(mailerService.sendMail).toHaveBeenCalledWith({
			to: 'test@test.com',
			subject: 'test | Confirm your email',
			template: './confirmation',
			context: {
				confirmationUrl: 'test/confirm-email?token=token'
			}
		})
		expect(result).toEqual(true)
	})

	it('should send reset password email', async () => {
		const result = await mailService.sendResetPassword('test@test.com', 'token')

		expect(configService.get).toHaveBeenCalledWith('app.baseUrl')
		expect(configService.get).toHaveBeenCalledWith('app.brand')
		expect(mailerService.sendMail).toHaveBeenCalledWith({
			to: 'test@test.com',
			subject: 'test | Reset your password',
			template: './reset-password',
			context: {
				resetPasswordUrl: 'test/reset-password?token=token'
			}
		})
		expect(result).toEqual(true)
	})

	it('should throw an exception if sendMail fails', async () => {
		jest.spyOn(mailerService, 'sendMail').mockRejectedValueOnce(new Error())

		try {
			const result = await mailService.sendConfirmEmail('test@test.com', 'token')
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException)
		}

		jest.spyOn(mailerService, 'sendMail').mockRejectedValueOnce(new Error())

		try {
			const result2 = await mailService.sendResetPassword('test@test.com', 'token')
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException)
		}
	})

	it('should throw an exception if configService.get returns undefined', async () => {
		jest.spyOn(configService, 'get').mockReturnValueOnce(undefined)

		try {
			const result = await mailService.sendConfirmEmail('test@test.com', 'token')
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException)
		}

		jest.spyOn(configService, 'get').mockReturnValueOnce(undefined)

		try {
			const result2 = await mailService.sendResetPassword('test@test.com', 'token')
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException)
		}
	})
})
