import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { ACCESS_DENIED, TOKEN_EXPIRED_OR_INVALID } from '../constants/common.constants'
import { ConfigService } from '@nestjs/config'
import { MODULE_KEY } from '../decorators/module.decorator'

interface JwtPayload {
	role: string

	[key: string]: string | number | boolean
}

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	canActivate(context: ExecutionContext): boolean {
		const moduleName = this.reflector.get<string>(MODULE_KEY, context.getClass())

		const roles = this.configService.get(`access.modules.${moduleName}`) ?? []
		if (!roles?.length) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const authorization = request.headers['authorization']
		if (!authorization) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}

		const token = this.extractToken(authorization)
		let payload: JwtPayload
		try {
			payload = this.jwtService.verify<JwtPayload>(token)
		} catch (err) {
			this.handleTokenError(err)
		}

		if (!this.hasRequiredRole(payload.role, roles)) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}

		return true
	}

	private extractToken(authorization: string): string {
		const parts = authorization.split(' ')
		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			throw new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
		}
		return parts[1]
	}

	private handleTokenError(err: unknown): void {
		if (err instanceof TokenExpiredError) {
			throw new HttpException(TOKEN_EXPIRED_OR_INVALID, HttpStatus.UNAUTHORIZED)
		}
		throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
	}

	private hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
		return requiredRoles.includes(userRole)
	}
}
