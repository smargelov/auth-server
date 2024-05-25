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
			expect('_id' in data ? data._id : undefined).toBeUndefined()
			expect('__v' in data ? data.__v : undefined).toBeUndefined()
			expect('createdAt' in data ? data.createdAt : undefined).toBeUndefined()
			expect('updatedAt' in data ? data.updatedAt : undefined).toBeUndefined()
			expect('otherField' in data ? data.otherField : undefined).toBe('otherValue')
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
						expect('_id' in item ? item._id : undefined).toBeUndefined()
						expect('__v' in item ? item.__v : undefined).toBeUndefined()
						expect('createdAt' in item ? item.createdAt : undefined).toBeUndefined()
						expect('updatedAt' in item ? item.updatedAt : undefined).toBeUndefined()
					}
				})
				expect('otherField' in data[0] ? data[0].otherField : undefined).toBe('otherValue1')
				expect('otherField' in data[1] ? data[1].otherField : undefined).toBe('otherValue2')
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
