import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleModel } from './role.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { RoleController } from './role.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { TokenModule } from '../token/token.module'

@Module({
	imports: [
		JwtModule,
		ConfigModule,
		TokenModule,
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
	controllers: [RoleController],
	exports: [RoleService]
})
export class RoleModule {}
