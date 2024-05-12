export default () => ({
	api: {
		prefix: process.env.API_PREFIX || 'api',
		port: process.env.API_PORT || 3001
	},
	roles: {
		admin: process.env.ADMIN_ROLE_NAME || 'admin',
		user: process.env.USER_ROLE_NAME || 'user'
	},
	adminEmail: process.env.ADMIN_EMAIL || 'admin@test.dev'
})
