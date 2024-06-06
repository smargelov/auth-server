import { ConfigService } from '@nestjs/config'
import { getMongoConfig } from '../mongo.config'

describe('Mongo Config', () => {
	let configService: ConfigService

	beforeEach(() => {
		configService = new ConfigService()
	})

	it('should throw an error if MONGO_APP_USER or MONGO_APP_PASSWORD is missing', async () => {
		jest.spyOn(configService, 'get').mockImplementation((key: string) => {
			if (key === 'mongo.user' || key === 'mongo.password') {
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
				case 'mongo.protocol':
					return 'mongodb+srv'
				case 'mongo.host':
					return 'cloud.mongodb.com'
				case 'mongo.user':
					return 'cloudUser'
				case 'mongo.password':
					return 'cloudPassword'
				case 'mongo.name':
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
				case 'mongo.protocol':
					return 'mongodb'
				case 'mongo.host':
					return 'localhost'
				case 'mongo.port':
					return '27017'
				case 'mongo.user':
					return 'user'
				case 'mongo.password':
					return 'password'
				case 'mongo.name':
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
			if (key === 'mongo.protocol') {
				return null
			}
			return 'value'
		})
		jest.spyOn(configService, 'get').mockReturnValueOnce('mongodb') // Default protocol
		const config = await getMongoConfig(configService)
		expect(config.uri.startsWith('mongodb://')).toBeTruthy()
	})
})
