import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserModel } from './user.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { RoleModule } from '../role/role.module'
import { PasswordService } from './password.service'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		RoleModule,
		ConfigModule,
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User'
				}
			}
		])
	],
	controllers: [UserController],
	providers: [UserService, PasswordService, UserModel],
	exports: [UserService]
})
export class UserModule {}
