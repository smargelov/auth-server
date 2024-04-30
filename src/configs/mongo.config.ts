import { ConfigService } from '@nestjs/config'
import type { TypegooseModuleOptions } from 'nestjs-typegoose'

const getMongoProtocol = (configService: ConfigService): string => {
	const protocol = configService.get('MONGO_PROTOCOL')
	if (protocol) {
		return protocol
	}
	return 'mongodb'
}

const getMongoHost = (configService: ConfigService): string => {
	const host = configService.get('MONGO_HOST')
	const port = configService.get('MONGO_PORT')
	const protocol = getMongoProtocol(configService)
	if (protocol === 'mongodb+srv' && host) {
		return host
	}
	if (host && port) {
		return host + ':' + port
	}
	if (host) {
		return host + ':27017'
	}
	return '127.0.0.1:27017'
}

const getMongoUri = (configService: ConfigService): string => {
	if (!configService.get('MONGO_APP_USER') || !configService.get('MONGO_APP_PASSWORD')) {
		throw new Error('Missing MONGO_APP_USER or MONGO_APP_PASSWORD')
	}
	return (
		getMongoProtocol(configService) +
			'://' +
			configService.get('MONGO_APP_USER') +
			':' +
			configService.get('MONGO_APP_PASSWORD') +
			'@' +
			getMongoHost(configService) +
			'/' +
			configService.get('MONGO_NAME') || ''
	)
}

const getMongoOptions = (): Record<string, unknown> => ({})

export const getMongoConfig = async (
	configService: ConfigService
): Promise<TypegooseModuleOptions> => ({
	uri: getMongoUri(configService),
	...getMongoOptions()
})
