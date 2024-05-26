export default () => ({
	api: {
		prefix: process.env.API_PREFIX || 'api',
		port: process.env.API_PORT || 3001
	},
	roles: {
		admin: process.env.ADMIN_ROLE_NAME || 'admin',
		user: process.env.USER_ROLE_NAME || 'user'
	},
	adminEmail: process.env.ADMIN_EMAIL || 'admin@test.dev',
	jwt: {
		secret: process.env.JWT_SECRET || 'hard!to_guess_secret',
		accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
		refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d'
	}
})
