import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getMongoConfig } from './configs/mongo.config'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserModule } from './user/user.module'
import { RoleModule } from './role/role.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig
		}),
		UserModule,
		RoleModule
	]
})
export class AppModule {}
