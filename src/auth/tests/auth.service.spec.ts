import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import { TokenService } from '../../token/token.service'
import { LoginDto } from '../dto/login.dto'
import { RegisterDto } from '../dto/register.dto'
import { UserModel } from '../../user/user.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Types } from 'mongoose'
import type { DocumentType } from '@typegoose/typegoose/lib/types'
import { AUTH_VALIDATE_ERROR_MESSAGE, RESET_PASSWORD_LINK_SENT } from '../auth.constants'

describe('AuthService', () => {
	let authService: AuthService
	let userService: UserService
	let tokenService: TokenService

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
						}),
						create: jest
							.fn()
							.mockResolvedValue({ ...new UserModel(), _id: new Types.ObjectId() })
					}
				},
				{
					provide: TokenService,
					useValue: {
						createTokens: jest
							.fn()
							.mockResolvedValue({ accessToken: 'token', refreshToken: 'token' }),
						getIdFromRefreshToken: jest.fn().mockReturnValue('testId')
					}
				}
			]
		}).compile()

		authService = module.get<AuthService>(AuthService)
		userService = module.get<UserService>(UserService)
		tokenService = module.get<TokenService>(TokenService)
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
		expect(tokenService.createTokens).toHaveBeenCalledWith(expect.any(Object))
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if user validation fails', async () => {
		jest.spyOn(userService, 'validateUser').mockResolvedValueOnce(
			Promise.reject(new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.NOT_FOUND))
		)

		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		await expect(authService.login(dto)).rejects.toThrow(HttpException)
	})

	it('should refresh tokens and return new tokens', async () => {
		const result = await authService.refresh('token')

		expect(tokenService.getIdFromRefreshToken).toHaveBeenCalledWith('token')
		expect(userService.findUserById).toHaveBeenCalledWith('testId')
		expect(tokenService.createTokens).toHaveBeenCalledWith(expect.any(Object))
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if token decoding fails', async () => {
		jest.spyOn(tokenService, 'getIdFromRefreshToken').mockImplementation(() => {
			throw new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.UNAUTHORIZED)
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
			expect.stringMatching(/^[0-9a-fA-F]{24}$/),
			'resetToken'
		)
		expect(result).toEqual({ message: RESET_PASSWORD_LINK_SENT })
	})

	it('should throw an exception if user is not found for reset password link', async () => {
		jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(
			Promise.reject(new HttpException('User not found', HttpStatus.NOT_FOUND))
		)

		await expect(authService.getResetPasswordLink('test@test.com')).rejects.toThrow(
			HttpException
		)
	})

	it('should register user and return tokens', async () => {
		const dto = new RegisterDto()
		dto.email = 'test@test.com'
		dto.password = 'password'
		dto.displayName = 'Test User'

		const result = await authService.register(dto)

		expect(userService.create).toHaveBeenCalledWith(dto)
		expect(tokenService.createTokens).toHaveBeenCalledWith(expect.any(Object))
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if user registration fails', async () => {
		jest.spyOn(userService, 'create').mockResolvedValueOnce(
			Promise.reject(new HttpException(AUTH_VALIDATE_ERROR_MESSAGE, HttpStatus.BAD_REQUEST))
		)

		const dto = new RegisterDto()
		dto.email = 'test@test.com'
		dto.password = 'password'
		dto.displayName = 'Test User'

		await expect(authService.register(dto)).rejects.toThrow(HttpException)
	})
})
