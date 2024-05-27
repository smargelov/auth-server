import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { ACCESS_DENIED, TOKEN_EXPIRED_OR_INVALID } from '../constants/common.constants'

interface JwtPayload {
	role: string

	[key: string]: string | number | boolean
}

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService
	) {}

	canActivate(context: ExecutionContext): boolean {
		const roles =
			this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) ||
			this.reflector.get<string[]>(ROLES_KEY, context.getClass())
		if (!roles) {
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
