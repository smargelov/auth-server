import config from '../configuration'

describe('Configuration', () => {
	it('should return correct api prefix', () => {
		process.env.API_PREFIX = 'testPrefix'
		expect(config().api.prefix).toBe('testPrefix')
	})

	it('should return correct api port', () => {
		process.env.API_PORT = '3002'
		expect(config().api.port).toBe('3002')
	})

	it('should return correct admin role name', () => {
		process.env.ADMIN_ROLE_NAME = 'testAdmin'
		expect(config().roles.admin).toBe('testAdmin')
	})

	it('should return correct user role name', () => {
		process.env.USER_ROLE_NAME = 'testUser'
		expect(config().roles.user).toBe('testUser')
	})

	it('should return correct admin email', () => {
		process.env.ADMIN_EMAIL = 'test@test.dev'
		expect(config().adminEmail).toBe('test@test.dev')
	})

	it('should return default values if environment variables are not set', () => {
		delete process.env.API_PREFIX
		delete process.env.API_PORT
		delete process.env.ADMIN_ROLE_NAME
		delete process.env.USER_ROLE_NAME
		delete process.env.ADMIN_EMAIL

		expect(config().api.prefix).toBe('api')
		expect(config().api.port).toBe(3001)
		expect(config().roles.admin).toBe('admin')
		expect(config().roles.user).toBe('user')
		expect(config().adminEmail).toBe('admin@test.dev')
	})
})
