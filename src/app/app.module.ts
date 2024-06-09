import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { getMongoConfig } from '../configs/mongo.config'
import { UserModule } from '../user/user.module'
import { RoleModule } from '../role/role.module'
import { AppInitializer } from './app.initializer'
import { ExcludeIdInterceptor } from '../common/interceptors/exclude-id.interceptor'
import { AuthModule } from '../auth/auth.module'
import { RoleGuard } from '../common/guards/role.guard'
import configuration from '../configs/configuration'
import { MailModule } from '../mail/mail.module'
import { LinkModule } from '../link/link.module'
import { CookieModule } from '../cookie/cookie.module'
import { TokenModule } from '../token/token.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configuration]
		}),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('jwt.secret'),
				signOptions: { expiresIn: configService.get<string>('jwt.accessTokenExpiresIn') }
			}),
			global: true
		}),
		UserModule,
		RoleModule,
		AuthModule,
		MailModule,
		LinkModule,
		CookieModule,
		TokenModule
	],
	providers: [AppInitializer, RoleGuard, Reflector],
	exports: [
		JwtModule,
		RoleGuard,
		UserModule,
		AuthModule,
		MailModule,
		LinkModule,
		CookieModule,
		TokenModule
	]
})
export class AppModule {}
