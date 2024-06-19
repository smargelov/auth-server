import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { TokensResponse } from './responses/tokens.response'
import { AUTH_VALIDATE_ERROR_MESSAGE, RESET_PASSWORD_LINK_SENT } from './auth.constants'
import { RegisterDto } from './dto/register.dto'
import { TokenService } from '../token/token.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService
	) {}

	async login(user: LoginDto): Promise<TokensResponse> {
		const validatedUser = await this.userService.validateUser(user.email, user.password)
		return this.tokenService.createTokens(validatedUser)
	}

	async refresh(refreshToken: string): Promise<TokensResponse> {
		const id = this.tokenService.getIdFromRefreshToken(refreshToken)
		const user = await this.userService.findUserById(id)
		return this.tokenService.createTokens(user)
	}

	async getResetPasswordLink(email: string): Promise<{ message: string }> {
		const user = await this.userService.findUserByEmail(email)
		const resetPasswordToken = await this.userService.resetPasswordHandler(user.email)
		await this.userService.updateResetPasswordTokenById(user._id.toString(), resetPasswordToken)

		return { message: RESET_PASSWORD_LINK_SENT }
	}

	async register(dto: RegisterDto): Promise<TokensResponse> {
		const user = await this.userService.create(dto)
		return this.tokenService.createTokens(user)
	}
}
