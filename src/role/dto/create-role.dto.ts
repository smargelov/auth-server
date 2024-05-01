import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ROLE_CODE_ALLOWED } from '../role.constants'

export class CreateRoleDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z]+$/, {
		message: ROLE_CODE_ALLOWED
	})
	code: string

	@IsString()
	@IsOptional()
	description?: string
}
