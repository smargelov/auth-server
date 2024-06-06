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
import { DocumentType } from '@typegoose/typegoose/lib/types'
import { HttpException } from '@nestjs/common'
import { UserModel } from '../user.model'

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
						create: jest.fn(),
						find: jest.fn(),
						findUserById: jest.fn(),
						deleteById: jest.fn(),
						updateById: jest.fn(),
						findUserByEmail: jest.fn(),
						findUserByConfirmEmailToken: jest.fn(),
						findUserByResetPasswordToken: jest.fn(),
						validateUser: jest.fn(),
						initialize: jest.fn(),
						resetPasswordHandler: jest.fn(),
						updateResetPasswordTokenById: jest.fn(),
						changePassword: jest.fn()
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
		jest.spyOn(service, 'create').mockResolvedValue(
			'create' as unknown as DocumentType<UserModel>
		)
		expect(await controller.create(dto)).toBe('create')
		expect(service.create).toHaveBeenCalledWith(dto)
	})

	it('should handle create user exception', async () => {
		const dto = new CreateUserDto()
		jest.spyOn(service, 'create').mockRejectedValue(new HttpException('Error', 400))
		await expect(controller.create(dto)).rejects.toThrow(HttpException)
	})

	it('should find users', async () => {
		const dto = new FindUserDto()
		jest.spyOn(service, 'find').mockResolvedValue('find' as unknown as any)
		expect(await controller.find(dto)).toBe('find')
		expect(service.find).toHaveBeenCalledWith(dto)
	})

	it('should handle find users exception', async () => {
		const dto = new FindUserDto()
		jest.spyOn(service, 'find').mockRejectedValue(new HttpException('Error', 400))
		await expect(controller.find(dto)).rejects.toThrow(HttpException)
	})

	it('should get user by id', async () => {
		const id = 'testId'
		jest.spyOn(service, 'findUserById').mockResolvedValue(
			'findUserById' as unknown as DocumentType<UserModel>
		)
		expect(await controller.getOne(id)).toBe('findUserById')
		expect(service.findUserById).toHaveBeenCalledWith(id)
	})

	it('should handle get user by id exception', async () => {
		const id = 'testId'
		jest.spyOn(service, 'findUserById').mockRejectedValue(new HttpException('Error', 400))
		await expect(controller.getOne(id)).rejects.toThrow(HttpException)
	})

	it('should delete user by id', async () => {
		const id = 'testId'
		jest.spyOn(service, 'deleteById').mockResolvedValue({ message: 'deleteById' })
		expect(await controller.delete(id)).toEqual({ message: 'deleteById' })
		expect(service.deleteById).toHaveBeenCalledWith(id)
	})

	it('should handle delete user by id exception', async () => {
		const id = 'testId'
		jest.spyOn(service, 'deleteById').mockRejectedValue(new HttpException('Error', 400))
		await expect(controller.delete(id)).rejects.toThrow(HttpException)
	})

	it('should update user by id', async () => {
		const id = 'testId'
		const dto = new UpdateUserDto()
		jest.spyOn(service, 'updateById').mockResolvedValue(
			'updateById' as unknown as DocumentType<UserModel>
		)
		expect(await controller.update(id, dto)).toBe('updateById')
		expect(service.updateById).toHaveBeenCalledWith(id, dto)
	})

	it('should handle update user by id exception', async () => {
		const id = 'testId'
		const dto = new UpdateUserDto()
		jest.spyOn(service, 'updateById').mockRejectedValue(new HttpException('Error', 400))
		await expect(controller.update(id, dto)).rejects.toThrow(HttpException)
	})
})
