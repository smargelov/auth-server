import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { FindUserDto } from '../dto/find-user.dto'

describe('UserController', () => {
	let controller: UserController
	let service: UserService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: {
						create: jest.fn().mockResolvedValue('create'),
						find: jest.fn().mockResolvedValue('find'),
						findUserById: jest.fn().mockResolvedValue('getOne'),
						deleteById: jest.fn().mockResolvedValue('delete'),
						updateById: jest.fn().mockResolvedValue('update')
					}
				}
			]
		}).compile()

		controller = module.get<UserController>(UserController)
		service = module.get<UserService>(UserService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should call create with correct params', async () => {
		const dto = new CreateUserDto()
		await controller.create(dto)
		expect(service.create).toHaveBeenCalledWith(dto)
	})

	it('should call find with correct params', async () => {
		const query = new FindUserDto()
		await controller.find(query)
		expect(service.find).toHaveBeenCalledWith(query)
	})

	it('should call getOne with correct params', async () => {
		const id = 'testId'
		await controller.getOne(id)
		expect(service.findUserById).toHaveBeenCalledWith(id)
	})

	it('should call delete with correct params', async () => {
		const id = 'testId'
		await controller.delete(id)
		expect(service.deleteById).toHaveBeenCalledWith(id)
	})

	it('should call update with correct params', async () => {
		const id = 'testId'
		const dto = new UpdateUserDto()
		await controller.update(id, dto)
		expect(service.updateById).toHaveBeenCalledWith(id, dto)
	})
})
