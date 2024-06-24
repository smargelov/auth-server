import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateDto {
	@IsOptional()
	@IsString()
	@IsEmail()
	email?: string

	@IsString()
	password: string

	@IsOptional()
	@IsString()
	displayName?: string
}
