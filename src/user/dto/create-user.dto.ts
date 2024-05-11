import { IsEmail, IsString, MinLength, Validate } from 'class-validator'
import { passwordRequirement, UserDto } from './user.dto'
import { PasswordValidation } from 'class-validator-password-check'

export class CreateUserDto extends UserDto {
	@IsString()
	@IsEmail()
	email: string

	@IsString()
	@MinLength(8)
	@Validate(PasswordValidation, [passwordRequirement])
	password: string
}
