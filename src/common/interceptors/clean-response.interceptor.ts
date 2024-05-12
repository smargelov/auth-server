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

type CleanResponse<T extends object> = Omit<
	T & ExtendedBase & TimeStamps,
	'_id' | '__v' | 'createdAt' | 'updatedAt'
>

@Injectable()
export class CleanResponseInterceptor<T extends object>
	implements NestInterceptor<T, T | CleanResponse<T> | (T | CleanResponse<T>)[]>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<T | CleanResponse<T> | (T | CleanResponse<T>)[]> {
		return next.handle().pipe(
			map((data) => {
				switch (true) {
					case Array.isArray(data):
						return data.map((item: T) => this.clean(item))
					case typeof data === 'object' && data.items && Array.isArray(data.items):
						return {
							...data,
							items: data.items.map((item: T) => this.clean(item))
						}
					case typeof data === 'object':
						return this.clean(data)
					default:
						return data
				}
			})
		)
	}

	private clean(item: T): CleanResponse<T> | T {
		const keysToRemove = ['_id', '__v', 'createdAt', 'updatedAt']

		// Check if item is a Mongoose document
		if (this.isMongooseDocument(item)) {
			const rest = { ...item.toObject() } // convert the item to a plain object

			keysToRemove.forEach((key) => {
				if (key in rest) {
					delete rest[key]
				}
			})

			return rest as CleanResponse<T>
		}

		// If item is not a Mongoose document, return it as is
		return item
	}

	private isMongooseDocument(item: T): item is T & MongooseDocument {
		return typeof (item as T & MongooseDocument)?.toObject === 'function'
	}
}
