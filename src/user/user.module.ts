import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserModel } from './user.model'
import { RoleModule } from '../role/role.module'
import { PasswordService } from './password.service'
import { JwtModule } from '@nestjs/jwt'
import { MailModule } from '../mail/mail.module'

@Module({
	imports: [
		JwtModule,
		RoleModule,
		MailModule,
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
