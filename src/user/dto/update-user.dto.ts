import { IsEmail, IsOptional, IsString, MinLength, Validate } from 'class-validator'
import { passwordRequirement, UserDto } from './user.dto'
import { PasswordValidation } from 'class-validator-password-check'

export class UpdateUserDto extends UserDto {
	@IsOptional()
	@IsString()
	@MinLength(8)
	@Validate(PasswordValidation, [passwordRequirement])
	password: string

	@IsOptional()
	@IsString()
	@IsEmail()
	email?: string
}
