import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserModel } from './user.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { RoleModule } from '../role/role.module'
import { PasswordService } from './password.service'

@Module({
	imports: [
		RoleModule,
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
	providers: [UserService, PasswordService]
})
export class UserModule {}
