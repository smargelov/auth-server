import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ListPaginationDto } from '../../common/dto/list-pagination.dto'

export class FindUserDto extends ListPaginationDto {
	@IsOptional()
	@IsString()
	search?: string

	@IsOptional()
	@IsString()
	role?: string

	@IsOptional()
	@Transform(({ value }) => value === 'true')
	@IsBoolean()
	isActive?: boolean
}
