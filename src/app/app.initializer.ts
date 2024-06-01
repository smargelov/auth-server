import { Injectable, OnModuleInit } from '@nestjs/common'
import { RoleService } from '../role/role.service'
import { UserService } from '../user/user.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppInitializer implements OnModuleInit {
	constructor(
		private readonly roleService: RoleService,
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}

	async onModuleInit() {
		const adminRoleName = this.configService.get('roles.admin')
		const userRoleName = this.configService.get('roles.user')

		// Initialize roles
		const isAdminRole = await this.roleService.initialize({
			code: adminRoleName,
			description: 'God mode role',
			isDefault: true
		})
		await this.roleService.initialize({
			code: userRoleName,
			description: 'Base access role',
			isDefault: true
		})

		// Create admin user
		if (isAdminRole) {
			const adminEmail = this.configService.get('adminEmail')
			await this.userService.initialize({
				email: adminEmail,
				password: 'admin', // You should use a secure way to set the admin password
				role: adminRoleName,
				isActive: true
			})
		}
	}
}
