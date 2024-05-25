import { ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'
import { ExcludeIdInterceptor } from '../exclude-id.interceptor'

describe('ExcludeIdInterceptor', () => {
	let interceptor: ExcludeIdInterceptor

	beforeEach(() => {
		interceptor = new ExcludeIdInterceptor()
	})

	it('should delete _id field from request body', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({
					body: {
						_id: 'testId',
						otherField: 'otherValue'
					}
				})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () => of('next')
		}

		interceptor.intercept(context, next).subscribe(() => {
			const body = context.switchToHttp().getRequest().body
			expect(body._id).toBeUndefined()
			expect(body.otherField).toBe('otherValue')
		})
	})
})
