import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ROLE_CODE_ALLOWED } from '../role.constants'
import { RoleDto } from './role.dto'

export class CreateRoleDto extends RoleDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z]+$/, {
		message: ROLE_CODE_ALLOWED
	})
	code: string

	@IsBoolean()
	@IsOptional()
	isDefault: boolean = false
}
