import { Test, TestingModule } from '@nestjs/testing'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { HttpException, HttpStatus } from '@nestjs/common'
import { DocumentType } from '@typegoose/typegoose/lib/types'
import { JwtPayload, TokenService } from '../token.service'
import { UserModel } from '../../user/user.model'
import { ACCESS_DENIED, TOKEN_EXPIRED_OR_INVALID } from '../../common/constants/common.constants'

describe('TokenService', () => {
	let service: TokenService
	let jwtService: JwtService
	let configService: ConfigService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TokenService,
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn(),
						verify: jest.fn()
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<TokenService>(TokenService)
		jwtService = module.get<JwtService>(JwtService)
		configService = module.get<ConfigService>(ConfigService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('createTokens', () => {
		it('should create access and refresh tokens', async () => {
			const user = {
				_id: '123',
				role: 'user',
				email: 'test@test.com',
				displayName: 'Test User',
				isActive: true,
				save: jest.fn()
			} as unknown as DocumentType<UserModel>

			const accessToken = 'accessToken'
			const refreshToken = 'refreshToken'

			jest.spyOn(jwtService, 'sign')
				.mockReturnValueOnce(accessToken)
				.mockReturnValueOnce(refreshToken)
			jest.spyOn(configService, 'get').mockReturnValue('1d')

			const result = await service.createTokens(user)

			expect(result).toEqual({ accessToken, refreshToken })
			expect(jwtService.sign).toHaveBeenCalledTimes(2)
			expect(jwtService.sign).toHaveBeenCalledWith({
				id: user._id.toString(),
				role: user.role,
				email: user.email,
				displayName: user.displayName,
				isActive: user.isActive
			})
			expect(jwtService.sign).toHaveBeenCalledWith(
				{ id: user._id.toString() },
				{ expiresIn: '1d' }
			)
		})
	})

	describe('handleTokenError', () => {
		it('should throw TOKEN_EXPIRED_OR_INVALID error for TokenExpiredError', () => {
			const error = new TokenExpiredError('msg', new Date())
			expect(() => service.handleTokenError(error)).toThrow(
				new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
			)
		})

		it('should throw ACCESS_DENIED error for other errors', () => {
			const error = new Error('msg')
			expect(() => service.handleTokenError(error)).toThrow(
				new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
			)
		})
	})

	describe('verifyToken', () => {
		it('should verify token and return payload', () => {
			const token = 'token'
			const payload = { id: '123' } as JwtPayload

			jest.spyOn(jwtService, 'verify').mockReturnValue(payload)

			const result = service.verifyToken<JwtPayload>(token)

			expect(result).toBe(payload)
			expect(jwtService.verify).toHaveBeenCalledWith(token)
		})

		it('should handle error when token verification fails', () => {
			const token = 'token'
			const error = new Error('msg')

			jest.spyOn(jwtService, 'verify').mockImplementation(() => {
				throw error
			})
			jest.spyOn(service, 'handleTokenError')

			expect(() => service.verifyToken<JwtPayload>(token)).toThrow(
				new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
			)
			expect(service.handleTokenError).toHaveBeenCalledWith(error)
		})
	})

	describe('extractToken', () => {
		it('should extract token from authorization header', () => {
			const authorization = 'Bearer token'
			const result = service.extractToken(authorization)

			expect(result).toBe('token')
		})

		it('should throw TOKEN_EXPIRED_OR_INVALID error if authorization format is invalid', () => {
			const authorization = 'Invalid token'
			expect(() => service.extractToken(authorization)).toThrow(
				new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
			)
		})
	})

	describe('getIdFromRefreshToken', () => {
		it('should return id from refresh token', () => {
			const refreshToken = 'token'
			const payload = { id: '123' }

			jest.spyOn(jwtService, 'verify').mockReturnValue(payload)

			const result = service.getIdFromRefreshToken(refreshToken)

			expect(result).toBe('123')
			expect(jwtService.verify).toHaveBeenCalledWith(refreshToken)
		})

		it('should throw ACCESS_DENIED error if id is not found in token', () => {
			const refreshToken = 'token'
			const payload = {}

			jest.spyOn(jwtService, 'verify').mockReturnValue(payload)

			expect(() => service.getIdFromRefreshToken(refreshToken)).toThrow(
				new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
			)
		})
	})
})
