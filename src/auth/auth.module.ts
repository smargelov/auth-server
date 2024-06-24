import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { CookieModule } from '../cookie/cookie.module'
import { TokenModule } from '../token/token.module'

@Module({
	imports: [UserModule, ConfigModule, CookieModule, TokenModule],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService]
})
export class AuthModule {}
