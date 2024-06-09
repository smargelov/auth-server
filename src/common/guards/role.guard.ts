import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AbstractBaseGuard } from './abstract-base.guard'
import { MODULE_KEY } from '../decorators/module.decorator'
import { ACCESS_DENIED } from '../constants/common.constants'
import { JwtPayload, TokenService } from '../../token/token.service'

interface RoleJwtPayload extends JwtPayload {
	role: string
}

@Injectable()
export class RoleGuard extends AbstractBaseGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		jwtService: JwtService,
		tokenService: TokenService,
		private readonly configService: ConfigService
	) {
		super(jwtService, tokenService)
	}

	canActivate(context: ExecutionContext): boolean {
		const moduleName = this.reflector.get<string>(MODULE_KEY, context.getClass())
		const roles = this.configService.get<string[]>(`access.modules.${moduleName}`) ?? []

		if (!roles.length) {
			return true
		}

		const authorization = this.getAuthorizationHeader(context)
		const token = this.extractToken(authorization)
		const payload = this.verifyToken<RoleJwtPayload>(token)

		if (!this.hasRequiredRole(payload.role, roles)) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}

		return true
	}

	private hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
		return requiredRoles.includes(userRole)
	}
}
