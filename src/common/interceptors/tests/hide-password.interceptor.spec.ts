import { ExecutionContext, CallHandler } from '@nestjs/common'
import { of } from 'rxjs'
import { HidePasswordInterceptor } from '../hide-password.interceptor'

describe('HidePasswordInterceptor', () => {
	let interceptor: HidePasswordInterceptor<{ passwordHash?: string }>

	beforeEach(() => {
		interceptor = new HidePasswordInterceptor()
	})

	it('should hide passwordHash in single object', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () =>
				of({
					passwordHash: 'testPasswordHash',
					otherField: 'otherValue'
				})
		} as CallHandler

		interceptor.intercept(context, next).subscribe((data) => {
			if (typeof data === 'object') {
				expect('passwordHash' in data ? data.passwordHash : undefined).toBeUndefined()
				expect('otherField' in data ? data.otherField : undefined).toBe('otherValue')
			}
		})
	})

	it('should hide passwordHash in array of objects', () => {
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({})
			})
		} as unknown as ExecutionContext

		const next = {
			handle: () =>
				of([
					{
						passwordHash: 'testPasswordHash1',
						otherField: 'otherValue1'
					},
					{
						passwordHash: 'testPasswordHash2',
						otherField: 'otherValue2'
					}
				])
		} as CallHandler

		interceptor.intercept(context, next).subscribe((data) => {
			if (Array.isArray(data)) {
				data.forEach((item) => {
					if (typeof item === 'object') {
						expect(
							'passwordHash' in item ? item.passwordHash : undefined
						).toBeUndefined()
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
