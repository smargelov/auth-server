import { IsEmail, IsString } from 'class-validator'

export class GetResetPasswordLinkDto {
	@IsString()
	@IsEmail()
	email: string
}
