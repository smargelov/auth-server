import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user.service'
import { UserModel } from '../user.model'
import { RoleService } from '../../role/role.service'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import { getModelToken } from 'nestjs-typegoose'
import { PasswordService } from '../password.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { FindUserDto } from '../dto/find-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'

describe('UserService', () => {
	let service: UserService
	let model: ReturnModelType<typeof UserModel>
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
				UserService,
				{
					provide: getModelToken('UserModel'),
					useValue: {
						create: mockCreate,
						find: mockFind,
						findById: mockFindById,
						findOneAndDelete: mockFindOneAndDelete,
						findOneAndUpdate: mockFindOneAndUpdate,
						findOne: mockFindOne
					}
				},
				{
					provide: RoleService,
					useValue: {
						roleExists: jest.fn().mockResolvedValue(true)
					}
				},
				{
					provide: PasswordService,
					useValue: {
						hashPassword: jest.fn().mockResolvedValue('hashedPassword')
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('user')
					}
				}
			]
		}).compile()

		service = module.get<UserService>(UserService)
		model = module.get<ReturnModelType<typeof UserModel>>(getModelToken('UserModel'))

		model.findOne = jest.fn().mockImplementation((query) => {
			if (query.email) {
				return {
					exec: jest.fn().mockResolvedValue(null)
				}
			} else if (query._id) {
				return {
					exec: jest.fn().mockResolvedValue({ _id: 'testId', email: 'test@test.com' })
				}
			}
			return {
				exec: jest.fn().mockResolvedValue(null)
			}
		})
		model.countDocuments = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue(10)
		})

		model.find = jest.fn().mockReturnValue({
			skip: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			exec: jest.fn().mockResolvedValue([])
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should call create with correct params', async () => {
		const dto = new CreateUserDto()
		await service.create(dto)
		expect(model.create).toHaveBeenCalledWith(dto)
	})

	it('should call findUserById with correct params', async () => {
		const id = 'testId'
		await service.findUserById(id)
		expect(model.findOne).toHaveBeenCalledWith({ _id: id })
	})

	it('should call find with correct params', async () => {
		const dto = new FindUserDto()
		await service.find(dto)
		expect(model.find).toHaveBeenCalled()
	})

	it('should call deleteById with correct params', async () => {
		const id = 'testId'
		await service.deleteById(id)
		expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: id })
	})

	it('should call updateById with correct params', async () => {
		const id = 'testId'
		const dto = new UpdateUserDto()
		await service.updateById(id, dto)
		expect(model.findOneAndUpdate).toHaveBeenCalledWith({ _id: id }, dto, { new: true })
	})
})
