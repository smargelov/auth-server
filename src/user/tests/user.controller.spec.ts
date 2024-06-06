import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { FindUserDto } from '../dto/find-user.dto'
import { JwtService } from '@nestjs/jwt'
import { RoleGuard } from '../../common/guards/role.guard'
import { ActiveGuard } from '../../common/guards/active.guard'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { UserModel } from '../user.model'
import { DocumentType } from '@typegoose/typegoose/lib/types'
import { HttpException } from '@nestjs/common'

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
						findUserById: jest.fn().mockResolvedValue('findUserById'),
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

		controller = module.get<UserController>(UserController)
		service = module.get<UserService>(UserService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should create a user', async () => {
		const dto = new CreateUserDto()
		expect(await controller.create(dto)).toBe('create')
		expect(service.create).toHaveBeenCalledWith(dto)
	})

	it('should find users', async () => {
		const dto = new FindUserDto()
		expect(await controller.find(dto)).toBe('find')
		expect(service.find).toHaveBeenCalledWith(dto)
	})

	it('should get user by id', async () => {
		const id = 'testId'
		expect(await controller.getOne(id)).toBe('findUserById')
		expect(service.findUserById).toHaveBeenCalledWith(id)
	})

	it('should delete user by id', async () => {
		const id = 'testId'
		expect(await controller.delete(id)).toBe('deleteById')
		expect(service.deleteById).toHaveBeenCalledWith(id)
	})

	it('should update user by id', async () => {
		const id = 'testId'
		const dto = new UpdateUserDto()
		expect(await controller.update(id, dto)).toBe('updateById')
		expect(service.updateById).toHaveBeenCalledWith(id, dto)
	})
})
