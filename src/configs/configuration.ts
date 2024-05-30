import * as yaml from 'yamljs'
import { join } from 'path'

const configYaml = yaml.load(join(__dirname, '../../config.yaml'))
export default () => ({
	api: {
		prefix: configYaml.api.prefix || 'api',
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
	access: {
		modules: {
			user: configYaml.access.modules.user || ['admin'],
			role: configYaml.access.modules.role || ['admin', 'user']
		}
	}
})
