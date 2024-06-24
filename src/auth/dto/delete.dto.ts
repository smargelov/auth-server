import { IsEmail, IsString } from 'class-validator'

export class DeleteDto {
	@IsString()
	@IsEmail()
	email: string

	@IsString()
	password: string
}
