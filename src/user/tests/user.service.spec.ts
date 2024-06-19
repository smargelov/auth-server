import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user.service'
import { getModelToken } from 'nestjs-typegoose'
import { UserModel } from '../user.model'
import { RoleService } from '../../role/role.service'
import { PasswordService } from '../password.service'
import { MailService } from '../../mail/mail.service'
import { ConfigService } from '@nestjs/config'
import { TokenService } from '../../token/token.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { HttpException, HttpStatus } from '@nestjs/common'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { FAILED_TO_CREATE_USER, USER_ALREADY_EXISTS } from '../user.constants'
import { Types } from 'mongoose'
import { ROLE_NOT_FOUND } from '../../role/role.constants'

describe('UserService', () => {
	let service: UserService
	let userModel: ModelType<UserModel>
	let roleService: RoleService
	let passwordService: PasswordService
	let mailService: MailService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getModelToken('UserModel'),
					useValue: {
						findOne: jest.fn(),
						create: jest.fn(),
						countDocuments: jest.fn(),
						find: jest.fn(),
						findOneAndDelete: jest.fn(),
						findOneAndUpdate: jest.fn()
					}
				},
				{
					provide: RoleService,
					useValue: {
						roleExists: jest.fn()
					}
				},
				{
					provide: PasswordService,
					useValue: {
						hashPassword: jest.fn(),
						comparePassword: jest.fn()
					}
				},
				{
					provide: MailService,
					useValue: {
						sendConfirmEmail: jest.fn(),
						sendResetPassword: jest.fn()
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn()
					}
				},
				{
					provide: TokenService,
					useValue: {
						createTokens: jest.fn(),
						getIdFromRefreshToken: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<UserService>(UserService)
		userModel = module.get<ModelType<UserModel>>(getModelToken('UserModel'))
		roleService = module.get<RoleService>(RoleService)
		passwordService = module.get<PasswordService>(PasswordService)
		mailService = module.get<MailService>(MailService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('create', () => {
		it('should create a user', async () => {
			const dto = new CreateUserDto()
			dto.email = 'test@test.com'
			dto.password = 'password'

			jest.spyOn(service as any, 'userExists').mockResolvedValue(false)
			jest.spyOn(roleService, 'roleExists').mockResolvedValue(true)
			jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashedpassword')
			jest.spyOn(mailService, 'sendConfirmEmail').mockResolvedValue(undefined)

			const createdUser = {
				_id: new Types.ObjectId(),
				email: 'test@test.com',
				passwordHash: 'hashedpassword',
				save: jest.fn().mockResolvedValue(true)
			} as unknown as DocumentType<UserModel>
			jest.spyOn(userModel, 'create').mockResolvedValue(createdUser as unknown as any)

			expect(await service.create(dto)).toBe(createdUser)
		})

		it('should throw an error if user already exists', async () => {
			const dto = new CreateUserDto()
			dto.email = 'test@test.com'
			dto.password = 'password'

			jest.spyOn(service as any, 'userExists').mockResolvedValue(true)

			await expect(service.create(dto)).rejects.toThrow(
				new HttpException(USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST)
			)
		})

		it('should throw an error if role does not exist', async () => {
			const dto = new CreateUserDto()
			dto.email = 'test@test.com'
			dto.password = 'password'
			dto.role = 'non-existent-role'

			jest.spyOn(service as any, 'userExists').mockResolvedValue(false)
			jest.spyOn(roleService, 'roleExists').mockResolvedValue(false)

			await expect(service.create(dto)).rejects.toThrow(
				new HttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
			)
		})

		it('should throw an error if user creation fails', async () => {
			const dto = new CreateUserDto()
			dto.email = 'test@test.com'
			dto.password = 'password'

			jest.spyOn(service as any, 'userExists').mockResolvedValue(false)
			jest.spyOn(roleService, 'roleExists').mockResolvedValue(true)
			jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashedpassword')
			jest.spyOn(mailService, 'sendConfirmEmail').mockResolvedValue(undefined)
			jest.spyOn(userModel, 'create').mockResolvedValue(null)

			await expect(service.create(dto)).rejects.toThrow(
				new HttpException(FAILED_TO_CREATE_USER, HttpStatus.INTERNAL_SERVER_ERROR)
			)
		})
	})
})
