import { Test, TestingModule } from '@nestjs/testing'
import { RoleController } from '../role.controller'
import { RoleService } from '../role.service'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import { JwtService } from '@nestjs/jwt'
import { RoleGuard } from '../../common/guards/role.guard'
import { ActiveGuard } from '../../common/guards/active.guard'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

describe('RoleController', () => {
	let controller: RoleController
	let service: RoleService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoleController],
			providers: [
				{
					provide: RoleService,
					useValue: {
						create: jest.fn().mockResolvedValue('create'),
						list: jest.fn().mockResolvedValue('list'),
						findById: jest.fn().mockResolvedValue('findById'),
						deleteById: jest.fn().mockResolvedValue('deleteById'),
						updateById: jest.fn().mockResolvedValue('updateById')
					}
				},
				{
					provide: JwtService,
					useValue: {
						verify: jest.fn().mockResolvedValue(true)
					}
				},
				RoleGuard,
				ActiveGuard,
				Reflector,
				ConfigService
			]
		}).compile()

		controller = module.get<RoleController>(RoleController)
		service = module.get<RoleService>(RoleService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should create a role', async () => {
		const dto = new CreateRoleDto()
		expect(await controller.create(dto)).toBe('create')
		expect(service.create).toHaveBeenCalledWith(dto)
	})

	it('should list roles', async () => {
		expect(await controller.list()).toBe('list')
		expect(service.list).toHaveBeenCalled()
	})

	it('should get role by id', async () => {
		const id = 'testId'
		expect(await controller.getByCode(id)).toBe('findById')
		expect(service.findById).toHaveBeenCalledWith(id)
	})

	it('should delete role by id', async () => {
		const id = 'testId'
		expect(await controller.delete(id)).toBe('deleteById')
		expect(service.deleteById).toHaveBeenCalledWith(id)
	})

	it('should update role by id', async () => {
		const id = 'testId'
		const dto = new UpdateRoleDto()
		expect(await controller.update(id, dto)).toBe('updateById')
		expect(service.updateById).toHaveBeenCalledWith(id, dto)
	})
})
