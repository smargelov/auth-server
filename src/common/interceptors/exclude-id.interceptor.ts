import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
// todo удалить
export class ExcludeIdInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest()
		if (request?.body?._id) {
			delete request.body._id
		}
		return next.handle()
	}
}
