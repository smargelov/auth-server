import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { PasswordValidationRequirement } from 'class-validator-password-check'

export const passwordRequirement: PasswordValidationRequirement = {
	mustContainLowerLetter: true,
	mustContainNumber: true,
	mustContainUpperLetter: true
}

export abstract class UserDto {
	@IsOptional()
	@IsString()
	displayName?: string

	@IsOptional()
	@IsString()
	role?: string

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = false

	@IsOptional()
	@IsBoolean()
	isConfirmedEmail?: boolean = false

	@IsOptional()
	@IsString()
	emailConfirmationToken?: string
}
