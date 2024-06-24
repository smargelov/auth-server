import config from '../configuration'
import * as yaml from 'yamljs'
import { join } from 'path'

jest.mock('yamljs', () => ({
	load: jest.fn().mockReturnValue({
		api: { prefix: 'auth-api', port: 3001 },
		roles: { admin: 'admin', user: 'user' },
		admin: { email: 'admin@test.dev' },
		jwt: { accessTokenExpiresIn: '15m', refreshTokenExpiresIn: '30d' },
		access: { modules: { user: ['admin'], role: ['admin'] } },
		app: {
			brand: 'testBrand',
			frontendUrl: 'http://localhost:3000',
			baseUrl: 'http://localhost:3001'
		},
		mail: { host: 'mail.test.dev', port: 587 }
	})
}))

describe('Configuration', () => {
	it('should return correct api prefix from yaml', () => {
		process.env.API_PREFIX = 'testPrefix'
		expect(config().api.prefix).toBe('auth-api')
	})

	it('should return correct api port from yaml', () => {
		process.env.API_PORT = '3002'
		expect(config().api.port).toBe(3001)
	})

	it('should return correct admin role name from yaml', () => {
		process.env.ADMIN_ROLE_NAME = 'testAdmin'
		expect(config().roles.admin).toBe('admin')
	})

	it('should return correct user role name from yaml', () => {
		process.env.USER_ROLE_NAME = 'testUser'
		expect(config().roles.user).toBe('user')
	})

	it('should return correct admin email from yaml', () => {
		process.env.ADMIN_EMAIL = 'test@test.dev'
		expect(config().adminEmail).toBe('admin@test.dev')
	})

	it('should return correct values from process.env if environment variables are set', () => {
		process.env.JWT_SECRET = 'testSecret'
		process.env.MONGO_PROTOCOL = 'mongodb+srv'
		process.env.MONGO_HOST = 'mongo.test.dev'
		process.env.MONGO_PORT = '27018'
		process.env.MONGO_APP_USER = 'testUser'
		process.env.MONGO_APP_PASSWORD = 'testPassword'
		process.env.MONGO_NAME = 'testDB'
		process.env.MAIL_SERVICE_USER = 'mailUser'
		process.env.MAIL_SERVICE_PASSWORD = 'mailPassword'
		process.env.MAIL_SERVICE_FROM = 'mailFrom'

		const cfg = config()

		expect(cfg.jwt.secret).toBe('testSecret')
		expect(cfg.mongo.protocol).toBe('mongodb+srv')
		expect(cfg.mongo.host).toBe('mongo.test.dev')
		expect(cfg.mongo.port).toBe('27018')
		expect(cfg.mongo.user).toBe('testUser')
		expect(cfg.mongo.password).toBe('testPassword')
		expect(cfg.mongo.name).toBe('testDB')
		expect(cfg.mail.user).toBe('mailUser')
		expect(cfg.mail.password).toBe('mailPassword')
		expect(cfg.mail.from).toBe('mailFrom')
	})

	it('should return default values if environment variables are not set', () => {
		delete process.env.API_PREFIX
		delete process.env.API_PORT
		delete process.env.ADMIN_ROLE_NAME
		delete process.env.USER_ROLE_NAME
		delete process.env.ADMIN_EMAIL
		delete process.env.JWT_SECRET
		delete process.env.MONGO_PROTOCOL
		delete process.env.MONGO_HOST
		delete process.env.MONGO_PORT
		delete process.env.MONGO_APP_USER
		delete process.env.MONGO_APP_PASSWORD
		delete process.env.MONGO_NAME
		delete process.env.MAIL_SERVICE_USER
		delete process.env.MAIL_SERVICE_PASSWORD
		delete process.env.MAIL_SERVICE_FROM

		const cfg = config()

		expect(cfg.api.prefix).toBe('auth-api')
		expect(cfg.api.port).toBe(3001)
		expect(cfg.roles.admin).toBe('admin')
		expect(cfg.roles.user).toBe('user')
		expect(cfg.adminEmail).toBe('admin@test.dev')
		expect(cfg.jwt.secret).toBe('hard!to_guess_secret')
		expect(cfg.mongo.protocol).toBe('mongodb')
		expect(cfg.mongo.host).toBe('127.0.0.1')
		expect(cfg.mongo.port).toBe('27017')
		expect(cfg.mongo.user).toBeUndefined()
		expect(cfg.mongo.password).toBeUndefined()
		expect(cfg.mongo.name).toBe('main')
		expect(cfg.mail.user).toBeUndefined()
		expect(cfg.mail.password).toBeUndefined()
		expect(cfg.mail.from).toBeUndefined()
	})
})
