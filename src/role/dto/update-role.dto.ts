import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ROLE_CODE_ALLOWED } from '../role.constants'

export class UpdateRoleDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z]+$/, {
		message: ROLE_CODE_ALLOWED
	})
	@IsOptional()
	code?: string

	@IsString()
	@IsOptional()
	description?: string
}
