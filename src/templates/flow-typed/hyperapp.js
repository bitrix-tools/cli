// @flow

declare type App = {
	model: any,
	view: View,
	actions: {
		[name: string]: (model: any, data?: any, actions?: any, error?: ErrorFunction) => any
	},
	subscriptions?: any,
	hooks?: Hooks,
	plugins?: any,
	root?: HTMLElement,
}

declare type View = (model: any, actions: any) => any

declare type Hooks = {
	onAction?: (name: string, data: any) => void,
	onUpdate?: (prev: any, next: any, data: any) => void,
	onRender?: (model: any, view: View) => void,
	onError?: ErrorFunction,
}

declare type ErrorFunction = (error: string | Error) => void

declare module 'hyperapp' {
	declare export function app(options: App): void

	declare export function h(tag: string, props: Object, children: string | mixed[]): any
}