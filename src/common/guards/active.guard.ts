import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AbstractBaseGuard } from './abstract-base.guard'
import { ACCESS_DENIED } from '../constants/common.constants'
import { JwtPayload, TokenService } from '../../token/token.service'

interface ActiveJwtPayload extends JwtPayload {
	isActive: boolean
}

@Injectable()
export class ActiveGuard extends AbstractBaseGuard implements CanActivate {
	constructor(jwtService: JwtService, tokenService: TokenService) {
		super(jwtService, tokenService)
	}

	canActivate(context: ExecutionContext): boolean {
		const authorization = this.getAuthorizationHeader(context)
		const token = this.extractToken(authorization)
		const payload = this.verifyToken<ActiveJwtPayload>(token)

		if (!payload.isActive) {
			throw new HttpException(ACCESS_DENIED, HttpStatus.FORBIDDEN)
		}

		return true
	}
}
