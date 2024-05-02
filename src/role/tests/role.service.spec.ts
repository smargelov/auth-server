import { Test, TestingModule } from '@nestjs/testing'
import { RoleService } from '../role.service'

describe('RoleService', () => {
	let service: RoleService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: RoleService,
					useValue: {
						// provide the methods of RoleService that you use in RoleController
						// with mock implementations. For example:
						// find: jest.fn().mockResolvedValue({}),
					}
				}
			]
		}).compile()

		service = module.get<RoleService>(RoleService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
