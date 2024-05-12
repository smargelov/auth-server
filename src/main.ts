import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true })

	const configService = app.get(ConfigService)
	const apiPrefix = configService.get('api.prefix')
	const apiPort = configService.get('api.port')
	app.setGlobalPrefix(apiPrefix)

	await app.listen(apiPort)
}

bootstrap()
