import { IsOptional, IsString } from 'class-validator'

export class RoleDto {
	@IsString()
	@IsOptional()
	description?: string
}
