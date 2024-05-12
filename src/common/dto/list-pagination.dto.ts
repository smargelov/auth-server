import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, Min } from 'class-validator'

export class ListPaginationDto {
	@IsOptional()
	@Transform(({ value }) => Number(value), { toClassOnly: true })
	@IsNumber()
	@Min(1)
	limit: number = 10

	@IsOptional()
	@Transform(({ value }) => Number(value), { toClassOnly: true })
	@IsNumber()
	@Min(0)
	offset: number = 0
}
