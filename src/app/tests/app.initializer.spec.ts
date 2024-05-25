import { Test, TestingModule } from '@nestjs/testing'
import { AppInitializer } from '../app.initializer'
import { RoleService } from '../../role/role.service'
import { UserService } from '../../user/user.service'
import { ConfigService } from '@nestjs/config'

describe('AppInitializer', () => {
	let appInitializer: AppInitializer
	let roleService: RoleService
	let userService: UserService
	let configService: ConfigService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppInitializer,
				{
					provide: RoleService,
					useValue: {
						initialize: jest.fn().mockResolvedValue(true)
					}
				},
				{
					provide: UserService,
					useValue: {
						initialize: jest.fn().mockResolvedValue(true)
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('admin')
					}
				}
			]
		}).compile()

		appInitializer = module.get<AppInitializer>(AppInitializer)
		roleService = module.get<RoleService>(RoleService)
		userService = module.get<UserService>(UserService)
		configService = module.get<ConfigService>(ConfigService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(appInitializer).toBeDefined()
	})

	it('should initialize roles and admin user on module init', async () => {
		await appInitializer.onModuleInit()

		expect(configService.get).toHaveBeenCalledWith('roles.admin')
		expect(configService.get).toHaveBeenCalledWith('roles.user')
		expect(configService.get).toHaveBeenCalledWith('adminEmail')

		expect(roleService.initialize).toHaveBeenCalledWith({
			code: 'admin',
			description: 'God mode role',
			isDefault: true
		})

		expect(roleService.initialize).toHaveBeenCalledWith({
			code: 'admin',
			description: 'Base access role',
			isDefault: true
		})

		expect(userService.initialize).toHaveBeenCalledWith({
			email: 'admin',
			password: 'admin',
			role: 'admin',
			isActive: true
		})
	})
})
