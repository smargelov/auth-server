import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app/app.module'
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true })
	app.use(cookieParser())

	const configService = app.get(ConfigService)
	const apiPrefix = configService.get('api.prefix')
	const apiPort = configService.get('api.port')
	app.setGlobalPrefix(apiPrefix, {
		exclude: ['/confirm-email', '/reset-password']
	})
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))

	await app.listen(apiPort)
}

bootstrap()
