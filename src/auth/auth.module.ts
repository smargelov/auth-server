import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'

@Module({
	imports: [UserModule, ConfigModule],
	controllers: [AuthController],
	providers: [AuthService]
})
export class AuthModule {}
