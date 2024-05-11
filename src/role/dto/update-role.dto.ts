import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ROLE_CODE_ALLOWED } from '../role.constants'
import { RoleDto } from './role.dto'

export class UpdateRoleDto extends RoleDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z]+$/, {
		message: ROLE_CODE_ALLOWED
	})
	@IsOptional()
	code?: string
}
