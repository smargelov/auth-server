import { ConfigService } from '@nestjs/config'
import { getMongoConfig } from '../mongo.config'

describe('Mongo Config', () => {
	let configService: ConfigService

	beforeEach(() => {
		configService = new ConfigService()
	})

	it('should throw an error if MONGO_APP_USER or MONGO_APP_PASSWORD is missing', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			if (key === 'MONGO_APP_USER' || key === 'MONGO_APP_PASSWORD') {
				return null
			}
			return 'value'
		})
		await expect(getMongoConfig(configService)).rejects.toThrow(
			'Missing MONGO_APP_USER or MONGO_APP_PASSWORD'
		)
	})

	it('should connect to a cloud database', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			switch (key) {
				case 'MONGO_PROTOCOL':
					return 'mongodb+srv'
				case 'MONGO_HOST':
					return 'cloud.mongodb.com'
				case 'MONGO_APP_USER':
					return 'cloudUser'
				case 'MONGO_APP_PASSWORD':
					return 'cloudPassword'
				case 'MONGO_NAME':
					return 'cloudDb'
				default:
					return null
			}
		})
		const config = await getMongoConfig(configService)
		expect(config.uri).toBe('mongodb+srv://cloudUser:cloudPassword@cloud.mongodb.com/cloudDb')
	})

	it('should get the correct Mongo config', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			switch (key) {
				case 'MONGO_PROTOCOL':
					return 'mongodb'
				case 'MONGO_HOST':
					return 'localhost'
				case 'MONGO_PORT':
					return '27017'
				case 'MONGO_APP_USER':
					return 'user'
				case 'MONGO_APP_PASSWORD':
					return 'password'
				case 'MONGO_NAME':
					return 'dbname'
				default:
					return null
			}
		})
		const config = await getMongoConfig(configService)
		expect(config.uri).toBe('mongodb://user:password@localhost:27017/dbname')
	})

	it('should use the correct Mongo protocol without protocol env', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			if (key === 'MONGO_PROTOCOL') {
				return null
			}
			return 'value'
		})
		const config = await getMongoConfig(configService)
		expect(config.uri.startsWith('mongodb://')).toBeTruthy()
	})

	it('should use the correct uri without port env', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			if (key === 'MONGO_PORT') {
				return null
			}
			return 'value'
		})
		const config = await getMongoConfig(configService)
		expect(config.uri).toBe('value://value:value@value:27017/value')
	})

	it('should use the correct uri without host and port env', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			if (key === 'MONGO_HOST' || key === 'MONGO_PORT') {
				return null
			}
			return 'value'
		})
		const config = await getMongoConfig(configService)
		expect(config.uri).toBe('value://value:value@127.0.0.1:27017/value')
	})
})
