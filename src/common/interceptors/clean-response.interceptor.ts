import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

interface ExtendedBase extends Base {
	__v?: never
}

interface MongooseDocument {
	toObject: () => object
}

type HasId = { id: string }
type MaybeHasId<T> = T extends HasId ? T : T & HasId

export type CleanResponse<T extends object> = Omit<
	MaybeHasId<T> & ExtendedBase & TimeStamps,
	'_id' | '__v' | 'createdAt' | 'updatedAt'
> & { id: string }

export type ExtendedType<T extends object> = MaybeHasId<T> & { id: string }

@Injectable()
export class CleanResponseInterceptor<T extends object>
	implements
		NestInterceptor<
			ExtendedType<T>,
			| ExtendedType<T>
			| CleanResponse<ExtendedType<T>>
			| (ExtendedType<T> | CleanResponse<ExtendedType<T>>)[]
		>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<
		| ExtendedType<T>
		| CleanResponse<ExtendedType<T>>
		| (ExtendedType<T> | CleanResponse<ExtendedType<T>>)[]
	> {
		return next.handle().pipe(
			map((data) => {
				switch (true) {
					case Array.isArray(data):
						return data.map((item: ExtendedType<T>) => this.clean(item))
					case typeof data === 'object' && data.items && Array.isArray(data.items):
						return {
							...data,
							items: data.items.map((item: ExtendedType<T>) => this.clean(item))
						}
					case typeof data === 'object':
						return this.clean(data)
					default:
						return data
				}
			})
		)
	}

	private clean(item: ExtendedType<T>): CleanResponse<ExtendedType<T>> | ExtendedType<T> {
		const keysToRemove = ['_id', '__v', 'createdAt', 'updatedAt', 'emailConfirmationToken']

		// Check if item is a Mongoose document
		if (this.isMongooseDocument(item)) {
			const rest: CleanResponse<ExtendedType<T>> = {
				...(item.toObject() as CleanResponse<ExtendedType<T>>)
			} // convert the item to a plain object

			if ('_id' in rest) {
				rest.id = rest._id.toString()
			}
			keysToRemove.forEach((key) => {
				if (key in rest) {
					delete rest[key]
				}
			})

			return rest as CleanResponse<ExtendedType<T>>
		}

		// If item is not a Mongoose document, return it as is
		return item
	}

	private isMongooseDocument(item: ExtendedType<T>): item is ExtendedType<T> & MongooseDocument {
		return typeof (item as ExtendedType<T> & MongooseDocument)?.toObject === 'function'
	}
}
