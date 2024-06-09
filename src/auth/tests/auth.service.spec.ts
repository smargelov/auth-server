import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from '../dto/login.dto'
import { UserModel } from '../../user/user.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Types } from 'mongoose'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { AUTH_VALIDATE_ERROR_MESSAGE, RESET_PASSWORD_LINK_SENT } from '../auth.constants'

describe('AuthService', () => {
	let authService: AuthService
	let userService: UserService
	let jwtService: JwtService
	let configService: ConfigService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: {
						validateUser: jest
							.fn()
							.mockResolvedValue({ ...new UserModel(), _id: new Types.ObjectId() }),
						findUserById: jest
							.fn()
							.mockResolvedValue({ ...new UserModel(), _id: new Types.ObjectId() }),
						findUserByEmail: jest
							.fn()
							.mockResolvedValue({ ...new UserModel(), _id: new Types.ObjectId() }),
						resetPasswordHandler: jest.fn().mockResolvedValue('resetToken'),
						updateResetPasswordTokenById: jest.fn().mockResolvedValue({
							...new UserModel(),
							_id: new Types.ObjectId()
						})
					}
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn().mockReturnValue('token'),
						decode: jest.fn().mockReturnValue({ id: 'testId' }),
						verify: jest.fn().mockReturnValue({ id: 'testId' })
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('1d')
					}
				}
			]
		}).compile()

		authService = module.get<AuthService>(AuthService)
		userService = module.get<UserService>(UserService)
		jwtService = module.get<JwtService>(JwtService)
		configService = module.get<ConfigService>(ConfigService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(authService).toBeDefined()
	})

	it('should login user and return tokens', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		const result = await authService.login(dto)

		expect(userService.validateUser).toHaveBeenCalledWith(dto.email, dto.password)
		expect(jwtService.sign).toHaveBeenCalledTimes(2)
		expect(configService.get).toHaveBeenCalledWith('jwt.refreshTokenExpiresIn')
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if user validation fails', async () => {
		jest.spyOn(userService, 'validateUser').mockResolvedValueOnce(
			new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.NOT_FOUND)
		)

		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		await expect(authService.login(dto)).rejects.toThrow(HttpException)
	})

	it('should refresh tokens and return new tokens', async () => {
		const result = await authService.refresh('token')

		expect(jwtService.verify).toHaveBeenCalledWith('token')
		expect(userService.findUserById).toHaveBeenCalledWith('testId')
		expect(jwtService.sign).toHaveBeenCalledTimes(2)
		expect(configService.get).toHaveBeenCalledWith('jwt.refreshTokenExpiresIn')
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if token decoding fails', async () => {
		jest.spyOn(jwtService, 'verify').mockImplementation(() => {
			throw new TokenExpiredError('expired', new Date())
		})

		await expect(authService.refresh('token')).rejects.toThrow(HttpException)
	})

	it('should get reset password link', async () => {
		const userMock: Partial<DocumentType<UserModel>> = {
			_id: new Types.ObjectId(),
			email: 'test@test.com',
			role: 'user',
			isActive: true,
			passwordHash: 'hashedpassword'
		}

		jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(
			userMock as DocumentType<UserModel>
		)

		const result = await authService.getResetPasswordLink('test@test.com')

		expect(userService.findUserByEmail).toHaveBeenCalledWith('test@test.com')
		expect(userService.resetPasswordHandler).toHaveBeenCalledWith('test@test.com')
		expect(userService.updateResetPasswordTokenById).toHaveBeenCalledWith(
			expect.stringMatching(/^[0-9a-fA-F]{24}$/), // проверка строки в формате ObjectId
			'resetToken'
		)
		expect(result).toEqual({ message: RESET_PASSWORD_LINK_SENT })
	})

	it('should throw an exception if user is not found for reset password link', async () => {
		jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(
			new HttpException('User not found', HttpStatus.NOT_FOUND)
		)

		await expect(authService.getResetPasswordLink('test@test.com')).rejects.toThrow(
			HttpException
		)
	})
})
