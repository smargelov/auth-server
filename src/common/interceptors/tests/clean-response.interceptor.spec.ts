import { ExecutionContext, CallHandler } from '@nestjs/common'
import { of } from 'rxjs'
import { CleanResponseInterceptor } from '../clean-response.interceptor'

describe('CleanResponseInterceptor', () => {
	let interceptor: CleanResponseInterceptor<object>

	beforeEach(() => {
		interceptor = new CleanResponseInterceptor<object>()
	})

	it('should clean single object', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () =>
				of({
					_id: 'testId',
					__v: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
					otherField: 'otherValue'
				})
		} as CallHandler

		interceptor.intercept(context, next).subscribe((data) => {
			expect(data).not.toHaveProperty('_id')
			expect(data).not.toHaveProperty('__v')
			expect(data).not.toHaveProperty('createdAt')
			expect(data).not.toHaveProperty('updatedAt')
			expect(data).toHaveProperty('otherField', 'otherValue')
		})
	})

	it('should clean array of objects', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () =>
				of([
					{
						_id: 'testId1',
						__v: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
						otherField: 'otherValue1'
					},
					{
						_id: 'testId2',
						__v: 2,
						createdAt: new Date(),
						updatedAt: new Date(),
						otherField: 'otherValue2'
					}
				])
		} as CallHandler

		interceptor.intercept(context, next).subscribe((data) => {
			if (Array.isArray(data)) {
				data.forEach((item) => {
					if (typeof item === 'object') {
						expect(item).not.toHaveProperty('_id')
						expect(item).not.toHaveProperty('__v')
						expect(item).not.toHaveProperty('createdAt')
						expect(item).not.toHaveProperty('updatedAt')
					}
				})
				expect(data[0]).toHaveProperty('otherField', 'otherValue1')
				expect(data[1]).toHaveProperty('otherField', 'otherValue2')
			}
		})
	})

	it('should not modify non-object data', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () => of('non-object data')
		} as CallHandler

		interceptor.intercept(context, next).subscribe((data) => {
			expect(data).toBe('non-object data')
		})
	})
})
