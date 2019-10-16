type primitive = string|number|object|boolean|Array<string|number|object|boolean>;

interface Options {
  [propName: string]: any;
}

interface AnyObject {
  [propName: string]: any;
}

interface ModelData {
  [propName: string]: any;
}

interface Refs {
  [propName: string]: HTMLElement;
}

declare class BaseInstance {
  readonly name: string
}

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

declare class Model extends BaseInstance {
  readonly _mid: number;
  readonly name: string|null|undefined;

  private _asc(): any;
  private _ash(): any;
  private _asl(): any;
  private _ast(): any;
  private _l(): any;
  private _c(): any;
  private _s(): any;
  private _h(): any;

  change?: boolean;

  isLock: boolean;

  update(config: object): [any|ModelData, null|undefined|object];

  request(config: object): [any, null|undefined|object];

  back(position?: -1|number, isStatic?: false|boolean): ModelData;

  set(data: object|ModelData|ModelInstance, isStatic?: false|boolean): ModelData;
  set(key: string|number, value: primitive, isStatic?: false|boolean): ModelData;

  get(key?: string|number|Function): ModelData;

  remove(key: string|number, isStatic?: false|boolean): ModelData;

  lock(): this;

  unlock(): this;

  clearStore(): this;

  link(proto: Function): any;

  on(eventType: string, func: Function): this;

  off(eventType?: string, func?: Function): this;

  emit(eventType: string, ...args: any): this;
}

declare class Atom extends BaseInstance {
  readonly _mid: number;
  readonly name: string|null|undefined;

  private _asl(): any;
  private _asi(): any;
  private _asp(): any;

  all(): Array<ModelInstance>;

  use(
    models: Array<ModelInstance>,
    ignores: Array<ModelInstance>,
    isStatic?: boolean
  ): this;

  pop(
    models: Array<ModelInstance>,
    isStatic?: false|boolean
  ): this;

  subscribe(func: Function): this;

  unsubscribe(func: Function): this;

  toData(): Array<ModelData>;

  toChunk(): object|any;
}

declare class View extends BaseInstance {
  readonly _vid: number;
  readonly name: string|null|undefined;
  readonly prefix: string;

  private axml: object;
  private _asb: any;
  private _ass: any;
  private _asp: any;
  private _assp: any;

  root: HTMLElement;

  props: AnyObject;

  refs: Refs;

  getParentProps(parentViewName?: string): object;

  mount(root: HTMLElement, data: AnyObject|ModelInstance): this;

  render(data: AnyObject|ModelInstance): this;

  renderToString(data: AnyObject|ModelInstance): string;
}

declare class Router extends BaseInstance {
  readonly _rid: number;
  readonly name: string|null|undefined;

  private _assert: any;
  private _status: any;
  private _idmap: any;
  private _clear: any;
  private _c: any;
  private _s: any;

  to(path: string, querys?: string|AnyObject, state?: AnyObject): this;

  add(route: string, actions: string, newAction: Function|Function[]): this;

  remove(route: string): this;

  resolve(state: AnyObject): this;

  start(path?: string, querys?: string|AnyObject, state?: AnyObject): this;

  stop(): this;
}

type ModelInstance = InstanceType<typeof Model>;
type ViewInstance  = InstanceType<typeof View>;
type AtomInstance  = InstanceType<typeof Atom>;
type RouterInstance = InstanceType<typeof Router>;

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

export function router(options?: Options): RouterInstance;

export const verify: VerifyInstance;

declare namespace cubec {
  function model(options?: Options): ModelInstance;
  function view(options?: Options): ViewInstance;
  function atom(options?: Options): AtomInstance;
  function router(options?: Options): RouterInstance;
  const verify: VerifyInstance;
}

export default cubec;
