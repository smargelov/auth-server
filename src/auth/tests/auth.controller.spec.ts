import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { CookieService } from '../../cookie/cookie.service'
import { UserService } from '../../user/user.service'
import { LoginDto } from '../dto/login.dto'
import { GetResetPasswordLinkDto } from '../dto/get-reset-password-link.dto'
import { RegisterDto } from '../dto/register.dto'
import { UpdateDto } from '../dto/update.dto'
import { HttpException } from '@nestjs/common'
import { Response } from 'express'
import { PASSWORD_CHANGED_SUCCESSFULLY } from '../auth.constants'
import { TokenService } from '../../token/token.service'

describe('AuthController', () => {
	let authController: AuthController
	let authService: AuthService
	let cookieService: CookieService
	let userService: UserService
	let tokenService: TokenService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						login: jest
							.fn()
							.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
						refresh: jest
							.fn()
							.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
						getResetPasswordLink: jest.fn(),
						register: jest.fn()
					}
				},
				{
					provide: CookieService,
					useValue: {
						setRefreshTokenCookie: jest.fn()
					}
				},
				{
					provide: UserService,
					useValue: {
						changePassword: jest.fn(),
						authUpdate: jest.fn()
					}
				},
				{
					provide: TokenService,
					useValue: {
						createTokens: jest
							.fn()
							.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
						getIdFromRefreshToken: jest.fn().mockReturnValue('id')
					}
				}
			]
		}).compile()

		authController = module.get<AuthController>(AuthController)
		authService = module.get<AuthService>(AuthService)
		cookieService = module.get<CookieService>(CookieService)
		userService = module.get<UserService>(UserService)
		tokenService = module.get<TokenService>(TokenService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(authController).toBeDefined()
	})

	it('should login user and return access token', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		const result = await authController.login(dto, response)

		expect(authService.login).toHaveBeenCalledWith(dto)
		expect(cookieService.setRefreshTokenCookie).toHaveBeenCalledWith(response, 'refresh')
		expect(result).toEqual({ accessToken: 'access' })
	})

	it('should handle login exception', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		jest.spyOn(authService, 'login').mockRejectedValue(new HttpException('Error', 400))

		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		await expect(authController.login(dto, response)).rejects.toThrow(HttpException)
	})

	it('should refresh tokens and return new access token', async () => {
		const response = {
			req: { cookies: { refreshToken: 'refresh' } },
			cookie: jest.fn()
		} as unknown as Response

		const result = await authController.refresh(response)

		expect(authService.refresh).toHaveBeenCalledWith('refresh')
		expect(cookieService.setRefreshTokenCookie).toHaveBeenCalledWith(response, 'refresh')
		expect(result).toEqual({ accessToken: 'access' })
	})

	it('should handle refresh exception when no token provided', async () => {
		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		await expect(authController.refresh(response)).rejects.toThrow(HttpException)
	})

	it('should handle refresh exception when service throws error', async () => {
		const response = {
			req: { cookies: { refreshToken: 'refresh' } },
			cookie: jest.fn()
		} as unknown as Response

		jest.spyOn(authService, 'refresh').mockRejectedValue(new HttpException('Error', 400))

		await expect(authController.refresh(response)).rejects.toThrow(HttpException)
	})

	it('should get reset password link', async () => {
		const dto = new GetResetPasswordLinkDto()
		dto.email = 'test@test.com'

		jest.spyOn(authService, 'getResetPasswordLink').mockResolvedValue({ message: 'link' })

		const result = await authController.getResetPasswordLink(dto)

		expect(authService.getResetPasswordLink).toHaveBeenCalledWith(dto.email)
		expect(result).toEqual({ message: 'link' })
	})

	it('should handle get reset password link exception', async () => {
		const dto = new GetResetPasswordLinkDto()
		dto.email = 'test@test.com'

		jest.spyOn(authService, 'getResetPasswordLink').mockRejectedValue(
			new HttpException('Error', 400)
		)

		await expect(authController.getResetPasswordLink(dto)).rejects.toThrow(HttpException)
	})

	it('should change password and return success message', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'newPassword'

		const response = {
			req: { cookies: { canChangePasswordForEmail: dto.email } },
			cookie: jest.fn(),
			clearCookie: jest.fn()
		} as unknown as Response

		jest.spyOn(userService, 'changePassword').mockResolvedValue('user' as any)
		jest.spyOn(tokenService, 'createTokens').mockResolvedValue({
			accessToken: 'access',
			refreshToken: 'refresh'
		})

		const result = await authController.changePassword(dto, response)

		expect(userService.changePassword).toHaveBeenCalledWith(dto)
		expect(tokenService.createTokens).toHaveBeenCalledWith('user')
		expect(cookieService.setRefreshTokenCookie).toHaveBeenCalledWith(response, 'refresh')
		expect(response.clearCookie).toHaveBeenCalledWith('canChangePasswordForEmail')
		expect(result).toEqual({ accessToken: 'access', message: PASSWORD_CHANGED_SUCCESSFULLY })
	})

	it('should handle change password exception when no cookie email provided', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'newPassword'

		const response = {
			req: { cookies: {} },
			cookie: jest.fn(),
			clearCookie: jest.fn()
		} as unknown as Response

		await expect(authController.changePassword(dto, response)).rejects.toThrow(HttpException)
	})

	it('should handle change password exception when service throws error', async () => {
		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'newPassword'

		const response = {
			req: { cookies: { canChangePasswordForEmail: dto.email } },
			cookie: jest.fn(),
			clearCookie: jest.fn()
		} as unknown as Response

		jest.spyOn(userService, 'changePassword').mockRejectedValue(new HttpException('Error', 400))

		await expect(authController.changePassword(dto, response)).rejects.toThrow(HttpException)
	})

	it('should register user and return access token', async () => {
		const dto = new RegisterDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		jest.spyOn(authService, 'register').mockResolvedValue({
			accessToken: 'access',
			refreshToken: 'refresh'
		})

		const result = await authController.register(dto, response)

		expect(authService.register).toHaveBeenCalledWith(dto)
		expect(cookieService.setRefreshTokenCookie).toHaveBeenCalledWith(response, 'refresh')
		expect(result).toEqual({ accessToken: 'access' })
	})

	it('should handle register exception', async () => {
		const dto = new RegisterDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		jest.spyOn(authService, 'register').mockRejectedValue(new HttpException('Error', 400))

		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		await expect(authController.register(dto, response)).rejects.toThrow(HttpException)
	})

	it('should update user and return new access token', async () => {
		const dto = new UpdateDto()
		dto.displayName = 'newDisplayName'
		dto.password = 'password'

		const response = {
			req: { cookies: { refreshToken: 'refresh' } },
			cookie: jest.fn()
		} as unknown as Response

		jest.spyOn(tokenService, 'getIdFromRefreshToken').mockReturnValue('id')
		jest.spyOn(userService, 'authUpdate').mockResolvedValue({
			accessToken: 'access',
			refreshToken: 'refresh'
		})

		const result = await authController.update(dto, response)

		expect(tokenService.getIdFromRefreshToken).toHaveBeenCalledWith('refresh')
		expect(userService.authUpdate).toHaveBeenCalledWith('id', dto)
		expect(cookieService.setRefreshTokenCookie).toHaveBeenCalledWith(response, 'refresh')
		expect(result).toEqual({ accessToken: 'access' })
	})

	it('should handle update exception when no refresh token provided', async () => {
		const dto = new UpdateDto()
		dto.displayName = 'newDisplayName'
		dto.password = 'password'

		const response = {
			req: { cookies: {} },
			cookie: jest.fn()
		} as unknown as Response

		await expect(authController.update(dto, response)).rejects.toThrow(HttpException)
	})

	it('should handle update exception when service throws error', async () => {
		const dto = new UpdateDto()
		dto.displayName = 'newDisplayName'
		dto.password = 'password'

		const response = {
			req: { cookies: { refreshToken: 'refresh' } },
			cookie: jest.fn()
		} as unknown as Response

		jest.spyOn(tokenService, 'getIdFromRefreshToken').mockReturnValue('id')
		jest.spyOn(userService, 'authUpdate').mockRejectedValue(new HttpException('Error', 400))

		await expect(authController.update(dto, response)).rejects.toThrow(HttpException)
	})
})
