import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { getMongoConfig } from '../configs/mongo.config'
import { UserModule } from '../user/user.module'
import { RoleModule } from '../role/role.module'
import { AppInitializer } from './app.initializer'
import { ExcludeIdInterceptor } from '../common/interceptors/exclude-id.interceptor'
import { AuthModule } from '../auth/auth.module'
import { RoleGuard } from '../common/guards/role.guard'
import configuration from '../configs/configuration'

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
		AuthModule
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: ExcludeIdInterceptor
		},
		AppInitializer,
		RoleGuard,
		Reflector
	],
	exports: [JwtModule, RoleGuard, UserModule, AuthModule]
})
export class AppModule {}
