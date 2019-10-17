type primitive = string|number|object|boolean|Array<string|number|object|boolean>;
type func = ()=>any;

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

interface Events {
  [propName: string]: func;
}

declare class BaseInstance {
  readonly name: string|null|undefined
}

interface ModelOptions extends Options {
  name?: string;
  data?: ModelData;
  url?: string;
  lock?: boolean;
  store?: boolean;
  history?: boolean;
  events?: Events;
}

interface ViewOptions extends Options {
  name?: string;
  props?: AnyObject;
  events?: Events;
  template: string;
}

interface AtomOptions extends Options {
  name?: string;
  use?: Array<ModelInstance>;
  ignore?: Array<ModelInstance>;
}

interface RouterOptions extends Options {
  target?: string;
  routes: { [routePath: string]: Array<string> };
  actions: { [actions: string]: func };
  events?: Events;
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

  isArrayOf: (...args: Array<func>) => (check: any) => boolean;
  isObjectOf: (...args: Array<func>) => (check: any) => boolean;
  isMultipleOf: (...args: Array<func>) => (check: any) => boolean;
}

declare class Model extends BaseInstance {
  readonly _mid: number;
  readonly change: boolean;
  readonly isLock: boolean;

  private _asc(): any;
  private _ash(): any;
  private _asl(): any;
  private _ast(): any;
  private _l(): any;
  private _c(): any;
  private _s(): any;
  private _h(): any;

  update(config: object): [any|ModelData, null|undefined|object];

  request(config: object): [any, null|undefined|object];

  back(position?: -1|number, isStatic?: false|boolean): ModelData;

  set(data: object|ModelData|ModelInstance, isStatic?: false|boolean): ModelData;
  set(key: string|number, value: primitive, isStatic?: false|boolean): ModelData;

  get(key?: string|number|func): ModelData;

  remove(key: string|number, isStatic?: false|boolean): ModelData;

  lock(): this;

  unlock(): this;

  clearStore(): this;

  link(proto: func): any;

  on(eventType: string, func: func): this;

  off(eventType?: string, func?: func): this;

  emit(eventType: string, ...args: any): this;
}

declare class Atom extends BaseInstance {
  readonly _mid: number;
  readonly length: number;

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

  subscribe(func: func): this;

  unsubscribe(func: func): this;

  toData(): Array<ModelData>;

  toChunk(): object|any;
}

declare class View extends BaseInstance {
  readonly _vid: number;
  readonly prefix: string;
  readonly refs: Refs;
  readonly props: AnyObject;

  private axml: object;
  private _asb: any;
  private _ass: any;
  private _asp: any;
  private _assp: any;

  root?: HTMLElement;

  getParentProps(parentViewName?: string): AnyObject;

  mount(root: HTMLElement, data: AnyObject|ModelInstance): this;

  render(data: AnyObject|ModelInstance): this;

  renderToString(data: AnyObject|ModelInstance): string;
}

declare class Router extends BaseInstance {
  readonly _rid: number;

  private _assert: any;
  private _status: any;
  private _idmap: any;
  private _clear: any;
  private _c: any;
  private _s: any;

  to(path: string, querys?: string|AnyObject, state?: AnyObject): this;

  add(route: string, actions: string, newAction: func|func[]): this;

  remove(route: string): this;

  resolve(state: AnyObject): this;

  start(path?: string, querys?: string|AnyObject, state?: AnyObject): this;

  stop(): this;
}

type ViewInstance = InstanceType<typeof View>;
type AtomInstance = InstanceType<typeof Atom>;
type ModelInstance = InstanceType<typeof Model>;
type RouterInstance = InstanceType<typeof Router>;

export function model(options?: ModelOptions): ModelInstance;
export namespace model {
  function extend(options: ModelOptions): ((options: Options)=> ModelInstance);
}

export function view(options?: ViewOptions): ViewInstance;
export namespace view {
  function extend(options: ViewOptions): ((options: Options)=> ViewInstance);
}

export function atom(options?: AtomOptions): AtomInstance;
export namespace atom {
  function extend(options: Options): ((options: Options)=> AtomInstance);
}

export function router(options?: RouterOptions): RouterInstance;

export const verify: VerifyInstance;

declare namespace cubec {
  function view(options?: ViewOptions): ViewInstance;
  function atom(options?: AtomOptions): AtomInstance;
  function model(options?: ModelOptions): ModelInstance;
  function router(options?: RouterOptions): RouterInstance;
  const verify: VerifyInstance;
}

export default cubec;
