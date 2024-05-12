import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getMongoConfig } from '../configs/mongo.config'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserModule } from '../user/user.module'
import { RoleModule } from '../role/role.module'
import { AppInitializer } from './app.initializer'
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
		UserModule,
		RoleModule
	],
	providers: [AppInitializer]
})
export class AppModule {}
