import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleModel } from './role.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { RoleController } from './role.controller'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: RoleModel,
				schemaOptions: {
					collection: 'Role'
				}
			}
		])
	],
	providers: [RoleService],
	controllers: [RoleController]
})
export class RoleModule {}
