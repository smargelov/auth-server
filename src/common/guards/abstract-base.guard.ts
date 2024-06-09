import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ACCESS_DENIED } from '../constants/common.constants'
import { JwtPayload, TokenService } from '../../token/token.service'

export abstract class AbstractBaseGuard {
	protected constructor(
		protected readonly jwtService: JwtService,
		protected readonly tokenService: TokenService
	) {}

	protected getAuthorizationHeader(context: ExecutionContext): string {
		const request = context.switchToHttp().getRequest()
		const authorization = request.headers['authorization']
		if (!authorization) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}
		return authorization
	}

	protected extractToken(authorization: string): string {
		return this.tokenService.extractToken(authorization)
	}

	protected verifyToken<T extends JwtPayload>(token: string): T {
		return this.tokenService.verifyToken<T>(token)
	}
}
