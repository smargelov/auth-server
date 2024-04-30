import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getMongoConfig } from './configs/mongo.config'
import { TypegooseModule } from 'nestjs-typegoose'

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig
		})
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
