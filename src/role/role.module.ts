import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleModel } from './role.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { RoleController } from './role.controller'
import { RoleInitializer } from './role.initializer'

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
	providers: [RoleService, RoleInitializer],
	controllers: [RoleController],
	exports: [RoleService]
})
export class RoleModule {}
