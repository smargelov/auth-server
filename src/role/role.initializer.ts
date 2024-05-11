import { Injectable, OnModuleInit } from '@nestjs/common'
import { RoleService } from './role.service'

@Injectable()
export class RoleInitializer implements OnModuleInit {
	constructor(private readonly roleService: RoleService) {}

	async onModuleInit() {
		await this.roleService.initialize({
			code: 'admin',
			description: 'God mode role',
			isDefault: true
		})
		await this.roleService.initialize({
			code: 'user',
			description: 'Base access role',
			isDefault: true
		})
	}
}
