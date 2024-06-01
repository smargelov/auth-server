import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from '../dto/login.dto'
import { UserModel } from '../../user/user.model'
import { HttpException, HttpStatus } from '@nestjs/common'

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
							.mockResolvedValue({ ...new UserModel(), _id: 'testId' }),
						findUserById: jest
							.fn()
							.mockResolvedValue({ ...new UserModel(), _id: 'testId' })
					}
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn().mockReturnValue('token'),
						decode: jest.fn().mockReturnValue({ id: 'testId' })
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
		expect(configService.get).toHaveBeenCalledWith('jwt.accessTokenExpiresIn')
		expect(configService.get).toHaveBeenCalledWith('jwt.refreshTokenExpiresIn')
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if user validation fails', async () => {
		jest.spyOn(userService, 'validateUser').mockResolvedValueOnce(
			new HttpException('Error', HttpStatus.NOT_FOUND)
		)

		const dto = new LoginDto()
		dto.email = 'test@test.com'
		dto.password = 'password'

		await expect(authService.login(dto)).rejects.toThrow(HttpException)
	})

	it('should refresh tokens and return new tokens', async () => {
		const result = await authService.refresh('token')

		expect(jwtService.decode).toHaveBeenCalledWith('token')
		expect(userService.findUserById).toHaveBeenCalledWith('testId')
		expect(jwtService.sign).toHaveBeenCalledTimes(2)
		expect(configService.get).toHaveBeenCalledWith('jwt.accessTokenExpiresIn')
		expect(configService.get).toHaveBeenCalledWith('jwt.refreshTokenExpiresIn')
		expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' })
	})

	it('should throw an exception if token decoding fails', async () => {
		jest.spyOn(jwtService, 'decode').mockReturnValueOnce(null)

		await expect(authService.refresh('token')).rejects.toThrow(HttpException)
	})
})
