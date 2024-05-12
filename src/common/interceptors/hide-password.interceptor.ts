import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

type SingleOrArray<T> = T extends any[] ? T : T[]

@Injectable()
export class HidePasswordInterceptor<T extends { passwordHash?: string }>
	implements NestInterceptor<SingleOrArray<T>, SingleOrArray<Omit<T, 'passwordHash'>>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<SingleOrArray<Omit<T, 'passwordHash'>>> {
		return next.handle().pipe(
			map((data) => {
				switch (true) {
					case Array.isArray(data):
						return data.map((item: T) => {
							const { passwordHash, ...result } = item
							return result
						})
					case typeof data === 'object' && data.items && Array.isArray(data.items):
						return {
							...data,
							items: data.items.map((item: T) => {
								const { passwordHash, ...result } = item
								return result
							})
						}
					case typeof data === 'object':
						const { passwordHash, ...result } = data
						return result
					default:
						return data
				}
			})
		)
	}
}
