import * as yaml from 'yamljs'
import { join } from 'path'

const configYaml = yaml.load(join(__dirname, '../../config.yaml'))

export default () => ({
	api: {
		prefix: configYaml.api.prefix || 'auth-api',
		port: configYaml.api.port || 3001
	},
	roles: {
		admin: configYaml.roles.admin || 'admin',
		user: configYaml.roles.user || 'user'
	},
	adminEmail: configYaml.admin.email || 'admin@test.dev',
	jwt: {
		secret: process.env.JWT_SECRET || 'hard!to_guess_secret',
		accessTokenExpiresIn: configYaml.jwt.accessTokenExpiresIn || '15m',
		refreshTokenExpiresIn: configYaml.jwt.refreshTokenExpiresIn || '30d'
	},
	mongo: {
		protocol: process.env.MONGO_PROTOCOL || 'mongodb',
		host: process.env.MONGO_HOST || '127.0.0.1',
		port: process.env.MONGO_PORT || '27017',
		user: process.env.MONGO_APP_USER,
		password: process.env.MONGO_APP_PASSWORD,
		name: process.env.MONGO_NAME || 'main'
	},
	access: {
		modules: {
			user: configYaml.access.modules.user || ['admin'],
			role: configYaml.access.modules.role || ['admin']
		}
	},
	app: {
		brand: configYaml.app.brand,
		frontendUrl: configYaml.app.frontendUrl || 'http://localhost:3000',
		baseUrl: configYaml.app.baseUrl || 'http://localhost:3001'
	},
	mail: {
		host: configYaml.mail.host,
		port: configYaml.mail.port,
		user: process.env.MAIL_SERVICE_USER,
		password: process.env.MAIL_SERVICE_PASSWORD,
		from: process.env.MAIL_SERVICE_FROM
	},
	settings: {
		can: {
			deleteSelfAccount: configYaml.settings.can?.deleteSelfAccount || false
		}
	}
})
