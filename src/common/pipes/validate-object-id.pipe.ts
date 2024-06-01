import {
	ArgumentMetadata,
	HttpException,
	HttpStatus,
	Injectable,
	PipeTransform
} from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
	constructor(private readonly errorMessage: string) {}

	transform(value: string, metadata: ArgumentMetadata): string {
		if (metadata.type === 'param' && metadata.data === 'id' && !Types.ObjectId.isValid(value)) {
			throw new HttpException(this.errorMessage, HttpStatus.NOT_FOUND)
		}
		return value
	}
}
