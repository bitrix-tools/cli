import { it, describe } from 'mocha';
import { assert } from 'chai';
import { code } from '../../test-utils/code';
import { convertFlowToTs } from '../../../src/utils/flow-to-ts';

describe('utils/flow-to-ts', () => {
	it('Should remove @flow leading comment', async () => {
		const source = code`
			// @flow
			// // @flow
			
			import { Type } from 'main.core';
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				import { Type } from 'main.core';
			`,
		);
	});

	it('Should convert $FlowFixMe, $FlowIgnore, $FlowExpectError comments to @ts-expect-error, @ts-ignore', async () => {
		const source = code`
			// $FlowFixMe
			export class TestFlow {}
			// $FlowIgnore
			export class TestFlow2 {}
			// $FlowExpectError
			export class TestFlow3 {}
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				// @ts-expect-error
				export class TestFlow
				{}
				// @ts-ignore
				export class TestFlow2
				{}
				// @ts-expect-error
				export class TestFlow3
				{}
			`,
		);
	});

	it('Should convert import typeof to import type', async () => {
		const source = code`
			import typeof Type from 'main.core';
			import typeof { Type2 } from 'main.core';
			import { typeof Type3 } from 'main.core';
			import { 
				typeof Type4,
				typeof Runtime,
				Tag,
				Dom,
				typeof Reflection,
			 } from 'main.core';
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				import type Type from 'main.core';
				import type { Type2 } from 'main.core';
				import { type Type3 } from 'main.core';
				import { type Type4, type Runtime, Tag, Dom, type Reflection } from 'main.core';
			`,
		);
	});

	it('Should convert * type annotation to any', async () => {
		const source = code`
			export function testFlow(): *
			{
				return 222;
			}
			
			const name: * = 'name';
			type TestType = {
				name: *;
				id: number;
			};
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				export function testFlow(): any
				{
					return 222;
				}
				
				const name: any = 'name';
				type TestType = {
					name: any;
					id: number;
				};
			`,
		);
	});

	it('Should convert covariant (+) and contravariant (-) modifiers to readonly', async () => {
		const source = code`
			export class TestFlow4
			{
				+covariant: string = 'testFlow';
				-contravariant: string = 'testFlow2';
			
				static +staticCovariant: string = 'testFlow3';
				static -contravariant: string = 'testFlow4';
			}
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				export class TestFlow4
				{
					readonly covariant: string = 'testFlow';
					contravariant: string = 'testFlow2';
				
					static readonly staticCovariant: string = 'testFlow3';
					static contravariant: string = 'testFlow4';
				}
			`,
		);
	});

	it('Should convert opaque type to type alias', async () => {
		const source = code`
			opaque type Interval = [number, number];
			opaque type Interval2 = {
				name: string,
				interval: number,
			};
			
			export opaque type IncludeBoundariesValue = 'all' | 'left' | 'right' | 'none';
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				type Interval = [number, number];
				type Interval2 = {
					name: string;
					interval: number;
				};
				
				export type IncludeBoundariesValue = 'all' | 'left' | 'right' | 'none';
			`,
		);
	});

	it('Should convert Flow utility types ($Exact, $Shape, $ReadOnly, $ReadOnlyArray) to TypeScript equivalents', async () => {
		const source = code`
			const uType1: $Exact<TestFlow> = {};
			function uType2(name: $Exact<TestFlow>): $Exact<TestFlow>
			{}
			function uType3(name: $Exact<TestFlow>, test: number): $Exact<TestFlow>
			{}
			
			const uType4: $Shape<TestFlow> = {};
			function uType5(name: $Shape<TestFlow>): $Shape<TestFlow>
			{}
			function uType6(name: $Shape<TestFlow>, test: string): $Shape<TestFlow>
			{}
			
			const uType7: $ReadOnly<TestFlow> = {};
			function uType8(name: $ReadOnly<TestFlow>): $ReadOnly<TestFlow>
			{}
			function uType9(name: $ReadOnly<TestFlow>, test: string): $ReadOnly<TestFlow>
			{}
			
			const uType10: $ReadOnlyArray<string> = [];
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				const uType1: TestFlow = {};
				function uType2(name: TestFlow): TestFlow
				{}
				function uType3(name: TestFlow, test: number): TestFlow
				{}
				
				const uType4: Partial<TestFlow> = {};
				function uType5(name: Partial<TestFlow>): Partial<TestFlow>
				{}
				function uType6(name: Partial<TestFlow>, test: string): Partial<TestFlow>
				{}
				
				const uType7: Readonly<TestFlow> = {};
				function uType8(name: Readonly<TestFlow>): Readonly<TestFlow>
				{}
				function uType9(name: Readonly<TestFlow>, test: string): Readonly<TestFlow>
				{}
				
				const uType10: ReadonlyArray<string> = [];
			`,
		);
	});

	it('Should convert nullable type annotation (?T) to T | null | undefined', async () => {
		const source = code`
			function test(): ?MyType
			{}
			
			const test2: ?MyType = null;
			
			type CustomType = {
				test: ?MyType,
			};
			
			const arr = (param: ?MyType): ?MyType => {};
			const arr2 = (param: ?MyType): ?MyType | TestType => {};
			const arr3 = (param: ?MyType | Type): Type | ?MyType | TestType => {};
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				function test(): MyType | null | undefined
				{}
				
				const test2: MyType | null | undefined = null;
				
				type CustomType = {
					test: MyType | null | undefined;
				};
				
				const arr = (param: MyType | null | undefined): MyType | null | undefined => {};
				const arr2 = (param: MyType | null | undefined): (MyType | null | undefined) | TestType => {};
				const arr3 = (param: (MyType | null | undefined) | Type): Type | (MyType | null | undefined) | TestType => {};
			`,
		);
	});

	it('Should remove type annotations from array destructuring pattern', async () => {
		const source = code`
			const [key: string, value: string = ''] = prop;
		`;

		const converted = await convertFlowToTs(source);

		assert.equal(
			converted,
			code`
				const [key, value = ''] = prop;
			`,
		);
	});
});
