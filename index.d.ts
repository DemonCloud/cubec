type primitive = string|number|object|boolean|Array<string|number|object|boolean>;

interface Options {
  [propName: string]: any;
}

interface Refs {
  [propName: string]: HTMLElement;
}

declare class BaseInstance {
  readonly name: string
}

declare class Model extends BaseInstance {
  readonly _mid: number;

  isLock: boolean;

  emulateJSON: boolean;

  private _asc(): any;
  private _ash(): any;
  private _asl(): any;
  private _ast(): any;
  private _asv(): any;
  private _c(): any;
  private _s(): any;
  private _v(): any;

  ajax(config: object): this;

  back(isStatic?: boolean): this;

  clear(isStatic?: boolean): this;

  clearStore(): this;

  emit(eventType: string, ...args: any[]): this;

  fetch(param?: object, header?: object): this;

  get(key?: string|number, by?: string|(() => any)): this;

  lock(): this;

  merge(data: object|InstanceType<typeof Model>, isStatic?: boolean): this;

  off(eventType: string, ...args: any[]): this;

  on(eventType: string, ...args: any[]): this;

  push(eventType: string): this;

  remove(key: string|number, isStatic?: boolean): this;

  seek(keys: string|Array<string>, needCombined?: boolean): this;

  set(data: object|InstanceType<typeof Model>, isStatic?: boolean): this;
  set(key: string|number, value: primitive, isStatic?: boolean): this;

  sync(header?: object): this;
  sync(url?: string, header?: object): this;

  toJSON(): string;

  unlock(): this;
}

declare class Atom extends BaseInstance {
  readonly _mid: number;

  private _assert(): any;
  private _connecty(): any;
  private _inFetchAll(): any;
  private _setFetchState(): any;
  private _transmit(): any;

  all(): Array<InstanceType<typeof Model>>

  fetchAll(params?: object, header?: object): this;
  fetchAll(models: Array<string>, params?: object, header?: object): this;

  getModelByNames(names: string|Array<string>): InstanceType<typeof Model>|Array<InstanceType<typeof Model>>;

  of(func: (() => any), ...bindArgs: any[]): this;

  out(names: string|Array<string>, isStatic?: boolean): this;

  reset(isStatic?: boolean): this;

  select(match: ((model: InstanceType<typeof Model>) => any)|RegExp, connect?: boolean): this;

  subscribe(func: (() => any)): this;

  toChunk(): object;

  toData(): Array<object>;

  unsubscribe(func: (() => any)): this;

  use(use: string|Array<string>|InstanceType<typeof Model>|Array<InstanceType<typeof Model>>, isStatic?: boolean): this;
}

declare class View extends BaseInstance {
  readonly _vid: number;

  readonly prefix: string;

  private axml: object;
  private _asb: any;
  private _ass: any;

  props: object;

  root: HTMLElement;

  refs: Refs;

  render(data: object|InstanceType<typeof Model>): this;

  renderToString(data: object|InstanceType<typeof Model>): string;
}

type ModelInstance = InstanceType<typeof Model>;

type ViewInstance  = InstanceType<typeof View>;

type AtomInstance  = InstanceType<typeof Atom>;

interface VerifyInstance {
  isArray: (check: any) => boolean;
  isArrayLike: (check: any) => boolean;
  isBoolean: (check: any) => boolean;
  isFloat: (check: any) => boolean;
  isInt: (check: any) => boolean;
  isNumber: (check: any) => boolean;
  isObject: (check: any) => boolean;
  isPrimitive: (check: any) => boolean;
  isRequired: (check: any) => boolean;
  isString: (check: any) => boolean;

  isArrayOf: (...args: Array<() => any>) => (check: any) => boolean;
  isObjectOf: (...args: Array<() => any>) => (check: any) => boolean;
  isMultipleOf: (...args: Array<() => any>) => (check: any) => boolean;
}

export function model(options?: Options): ModelInstance;
export namespace model {
  function extend(options: Options): ((options: Options) => ModelInstance);
}

export function view(options?: Options): ViewInstance;
export namespace view {
  function extend(options: Options): ((options: Options) => ViewInstance);
}

export function atom(options?: Options): AtomInstance;
export namespace atom {
  function extend(options: Options): ((options: Options) => AtomInstance);
}

export const verify: VerifyInstance;

declare namespace cubec {
  function model(options?: Options): ModelInstance;
  function view(options?: Options): ViewInstance;
  function atom(options?: Options): AtomInstance;
  const verify: VerifyInstance;
}

export default cubec;
