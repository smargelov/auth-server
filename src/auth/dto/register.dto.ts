import { IsEmail, IsOptional, IsString, MinLength, Validate } from 'class-validator'
import { passwordRequirement } from '../../user/dto/user.dto'
import { PasswordValidation } from 'class-validator-password-check'

export class RegisterDto {
	@IsString()
	@IsEmail()
	email: string

	@IsString()
	@MinLength(8)
	@Validate(PasswordValidation, [passwordRequirement])
	password: string

	@IsOptional()
	@IsString()
	displayName?: string
}
