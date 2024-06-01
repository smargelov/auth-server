import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { LoginDto } from '../dto/login.dto'

describe('AuthController', () => {
	let authController: AuthController
	let authService: AuthService

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
							.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' })
					}
				}
			]
		}).compile()

		authController = module.get<AuthController>(AuthController)
		authService = module.get<AuthService>(AuthService)
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

		const result = await authController.login(dto, {
			req: { cookies: {} },
			cookie: jest.fn()
		} as any)

		expect(authService.login).toHaveBeenCalledWith(dto)
		expect(result).toEqual({ accessToken: 'access' })
	})

	it('should refresh tokens and return new access token', async () => {
		const result = await authController.refresh({
			req: { cookies: { refreshToken: 'refresh' } },
			cookie: jest.fn()
		} as any)

		expect(authService.refresh).toHaveBeenCalledWith('refresh')
		expect(result).toEqual({ accessToken: 'access' })
	})
})
