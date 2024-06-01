import { ConfigService } from '@nestjs/config'
import type { TypegooseModuleOptions } from 'nestjs-typegoose'

const getMongoUri = (configService: ConfigService): string => {
	const protocol = configService.get<string>('mongo.protocol')
	const user = configService.get<string>('mongo.user')
	const password = configService.get<string>('mongo.password')
	const host = configService.get<string>('mongo.host')
	const port = configService.get<string>('mongo.port')
	const name = configService.get<string>('mongo.name')

	if (!user || !password) {
		throw new Error('Missing MONGO_APP_USER or MONGO_APP_PASSWORD')
	}

	let uri = `${protocol}://${user}:${password}@${host}`
	if (protocol !== 'mongodb+srv') {
		uri += `:${port}`
	}
	uri += `/${name}`

	return uri
}

const getMongoOptions = (): Record<string, unknown> => ({
	// Any other MongoDB options can be added here
})

export const getMongoConfig = async (
	configService: ConfigService
): Promise<TypegooseModuleOptions> => ({
	uri: getMongoUri(configService),
	...getMongoOptions()
})
