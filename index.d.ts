type primitive = string|number|object|boolean|Array<string|number|object|boolean>;
type func = Function;

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
  [propName: string]: any;
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
  plugin?: { [x: string]: ViewOptions|ViewInstance|ExportExtendViewInstance|func }
  events?: Events;
  template?: string;
  render?: string;
}

interface AtomOptions extends Options {
  name?: string;
  use?: Array<ModelInstance|AtomInstance>;
  ignore?: Array<ModelInstance|AtomInstance>;
}

interface RouterOptions extends Options {
  targets?: string|Array<string>;
  routes: { [routePath: string]: Array<string> };
  actions: { [actions: string]: func };
  events?: Events;
}

interface PluginOptions extends Options {
  events?: AnyObject;
  render?: string;
  template?: string;
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

  constructor(options?: ModelOptions)

  extend(extender?: AnyObject): this;

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
  private _asp: any;
  private _assp: any;
  private _aspu: any;
  private _assu: any;
  private _assr: any;

  root?: HTMLElement;

  mount(root: HTMLElement, data?: AnyObject|ModelInstance): this;

  render(data?: AnyObject|ModelInstance|AtomInstance): this;

  renderToString(data?: AnyObject|ModelInstance|AtomInstance): string;
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

  replace(path: string, querys?: string|AnyObject, state?: AnyObject): this;

  replaceOnly(path: string, querys?: string|AnyObject, state?: AnyObject, asPush?: boolean): this;

  add(route: string, actions: string, newAction: func|func[]): this;

  remove(route: string): this;

  resolve(state: AnyObject): this;

  start(path?: string|boolean, querys?: string|AnyObject, state?: AnyObject): this;

  stop(): this;
}

type ViewInstance = InstanceType<typeof View>;
type AtomInstance = InstanceType<typeof Atom>;
type ModelInstance = InstanceType<typeof Model>;
type RouterInstance = InstanceType<typeof Router>;

type ExportExtendAtomInstance = ((options: Options)=> AtomInstance);
type ExportExtendViewInstance = ((options: Options)=> ViewInstance);
type ExportExtendModelInstance = ((options: Options)=> ModelInstance);
type ExportExtendRouterInstance = ((options: Options)=> RouterInstance);

export interface model {
  (options?: ModelOptions): ModelInstance;
  extend(options: ModelOptions): ExportExtendModelInstance;
  link(linkMethod: string, linkProto: string, linkRuntime: string, linkFunc: func, idt?: any): func;
}

export interface view {
  (options?: ViewOptions): ViewInstance;
  extend(options: ViewOptions): ExportExtendViewInstance;
  plugin(name: string, options: ViewInstance|ViewOptions|func): ViewOptions|func;
}

export interface atom {
  (options?: AtomOptions): AtomInstance;
  extend(options: AtomOptions): ExportExtendAtomInstance;
}

export interface router {
  (options?: RouterOptions): RouterInstance;
  extend(options: RouterOptions): ExportExtendRouterInstance;
}

export const verify: VerifyInstance;
export const struct: AnyObject;

declare namespace cubec {
  const model: model;
  const view: view;
  const atom: atom;
  const router: router;
  const struct: AnyObject;
  const verify: VerifyInstance;
}

export default cubec;
