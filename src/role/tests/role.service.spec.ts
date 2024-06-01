import { Test, TestingModule } from '@nestjs/testing'
import { RoleService } from '../role.service'
import { RoleModel } from '../role.model'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import { InitializeRoleDto } from '../dto/initialize-role.dto'
import { ReturnModelType } from '@typegoose/typegoose'
import { getModelToken } from 'nestjs-typegoose'

describe('RoleService', () => {
	let service: RoleService
	let model: ReturnModelType<typeof RoleModel>
	let mockCreate, mockFind, mockFindById, mockFindOneAndDelete, mockFindOneAndUpdate, mockFindOne

	beforeAll(async () => {
		mockCreate = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('create')
		})
		mockFind = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('find')
		})
		mockFindById = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('getOne')
		})
		mockFindOneAndDelete = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('delete')
		})
		mockFindOneAndUpdate = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('update')
		})
		mockFindOne = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue('findOne')
		})

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoleService,
				{
					provide: getModelToken('RoleModel'),
					useValue: {
						create: mockCreate,
						find: mockFind,
						findById: mockFindById,
						findOneAndDelete: mockFindOneAndDelete,
						findOneAndUpdate: mockFindOneAndUpdate,
						findOne: mockFindOne
					}
				}
			]
		}).compile()

		service = module.get<RoleService>(RoleService)
		model = module.get<ReturnModelType<typeof RoleModel>>(getModelToken('RoleModel'))
		service.roleExists = jest.fn().mockResolvedValue(false)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should call create with correct params', async () => {
		const dto = new CreateRoleDto()
		await service.create(dto)
		expect(model.create).toHaveBeenCalledWith(dto)
	})

	it('should call initialize with correct params', async () => {
		const dto = new InitializeRoleDto()
		await service.initialize(dto)
		expect(model.create).toHaveBeenCalledWith(dto)
	})

	it('should call list with correct params', async () => {
		await service.list()
		expect(model.find).toHaveBeenCalled()
	})

	it('should call findById with correct params', async () => {
		const id = 'testId'
		await service.findById(id)
		expect(model.findById).toHaveBeenCalledWith(id)
	})

	it('should call deleteById with correct params', async () => {
		const id = 'testId'
		await service.deleteById(id)
		expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: id })
	})

	it('should call updateById with correct params', async () => {
		const id = 'testId'
		const dto = new UpdateRoleDto()
		await service.updateById(id, dto)
		expect(model.findOneAndUpdate).toHaveBeenCalledWith({ _id: id }, dto, { new: true })
	})
})
