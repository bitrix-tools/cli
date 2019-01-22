// @flow

type stringOrArray = string | Array<string>;
type stringOrMap = ?string|{[key: string]: any};
type result = ?string|number;

declare module 'BX' {
	declare export function message(mess: string | {[name: string]: string}): ?string | boolean;
	declare export function namespace(namespace: string): Function | {[key: any]: any};
	declare export function getClass(name: string): ?Function;
	declare export function addClass(element: ?Element, className: stringOrArray): void;
	declare export function removeClass(element: ?Element, className: stringOrArray): void;
	declare export function hasClass(element: ?Element, className: stringOrArray): boolean;
	declare export function toggleClass(element: ?Element, className: stringOrArray): void;
	declare export function bind(target: Element, event: string, handler: Function): void;
	declare export function unbind(target: Element, event: string, handler: Function): void;
	declare export function debug(...args: any): void;
	declare export function proxy(fn: Function, context: any): Function;
	declare export function delegate(fn: Function, context: any): Function;
	declare export function addCustomEvent(target: any, event: string, handler: Function): void;
	declare export function removeCustomEvent(target: any, event: string, handler: Function): void;
	declare export function debounce(callback: Function, time: Number, context?: any): Function;
	declare export function throttle(callback: Function, time: Number, context?: any): Function;
	declare export function processHTML(data: string, runFirst?: boolean): ProcessHtmlResult;
	declare export function load(items: Array<string>, callback: Function, document: any): void;
	declare export function getCookie(name: string): any;
	declare export function setCookie(name: string, value: string, options: any): any;
	declare export function create(tag: string, options: any): HTMLElement | HTMLIFrameElement;
	declare export function getSessionId(): string;
	declare export function show(element: ?HTMLElement): void;
	declare export function hide(element: ?HTMLElement): void;
	declare export function isShown(element: ?HTMLElement): void;
	declare export function toggle(element: ?HTMLElement): void;
	declare export function style(element: ?HTMLElement, prop: stringOrMap, value?: any): result;
	declare export function replace(oldElement: ?HTMLElement, newElement: ?HTMLElement): void;
	declare export function remove(element: ?HTMLElement): void;
	declare export function clean(element: ?HTMLElement): void;
	declare export function insertBefore(current: ?HTMLElement, target: ?HTMLElement): void;
	declare export function insertAfter(current: ?HTMLElement, target: ?HTMLElement): void;
	declare export function append(current: ?HTMLElement, target: ?HTMLElement): void;
	declare export function prepend(current: ?HTMLElement, target: ?HTMLElement): void;
	declare export function ready(callback: Function): void;
	declare export function clone<T>(value: T): T;

	declare export class type {
		static isString(value: any): boolean;
		static isNotEmptyString(value: any): boolean;
		static isFunction(value: any): boolean;
		static isObject(value: any): boolean;
		static isObjectLike(value: any): boolean;
		static isPlainObject(value: any): boolean;
		static isBoolean(value: any): boolean;
		static isNumber(value: any): boolean;
		static isInteger(value: any): boolean;
		static isFloat(value: any): boolean;
		static isArray(value: any): boolean;
		static isArrayLike(value: any): boolean;
		static isDate(value: any): boolean;
		static isDomNode(value: any): boolean;
		static isElementNode(value: any): boolean;
		static isTextNode(value: any): boolean;
		static isMap(value: any): boolean;
		static isSet(value: any): boolean;
		static isWeakMap(value: any): boolean;
		static isWeakSet(value: any): boolean;
		static isPrototype(value: any): boolean;
		static isNil(value: any): boolean;
		static isNull(value: any): boolean;
		static isUndefined(value: any): boolean;
	}

	declare export class ajax {
		static runAction(action: string, config: {[key: string]: any}): PromiseLike<any>;
	}
}
