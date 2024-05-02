import { Test, TestingModule } from '@nestjs/testing'
import { RoleController } from '../role.controller'
import { RoleService } from '../role.service'

describe('RoleController', () => {
	let controller: RoleController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoleController],
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

		controller = module.get<RoleController>(RoleController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
