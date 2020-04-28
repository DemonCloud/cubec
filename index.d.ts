type primitive = string|number|object|boolean|Array<string|number|object|boolean>;

type func = Function;

type PluginInstanceExport = [func, AnyObject, Events?];

interface Options {
  [propName: string]: any;
}

interface AnyObject {
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

interface PluginOptions extends Options {
  constructor?: func;
  name?: string;
  events?: Events;
}

interface ModelOptions extends Options {
  name?: string;
  data?: AnyObject;
  lock?: boolean;
  plugin?: (PluginInstanceExport|string)[]; // plugin type
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
  base?: string;
  routes: { [routePath: string]: string|string[] };
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

  constructor(options?: ModelOptions)

  set(data: object|AnyObject|ModelInstance, isStatic?: false|boolean): AnyObject;
  set(key: string|number, value: primitive, isStatic?: false|boolean): AnyObject;

  get(key?: string|number|func): any;

  remove(key: string|number, isStatic?: false|boolean): AnyObject;

  lock(): this;

  unlock(): this;

  link(proto: func): any;

  on(eventType: string, func: func): this;

  off(eventType?: string, func?: func): this;

  emit(eventType: string, ...args: any): this;

  extend(extender?: AnyObject): this;

  request(config: object): [any, null|undefined|AnyObject];
}

declare class Atom extends BaseInstance {
  readonly _mid: number;
  readonly length: number;

  all(): (ModelInstance|AtomInstance)[];

  use(
    models: (ModelInstance|AtomInstance)[],
    ignores: (ModelInstance|AtomInstance)[],
    isStatic?: boolean
  ): this;

  pop(
    models: (ModelInstance|AtomInstance)[],
    isStatic?: false|boolean
  ): this;

  subscribe(func: func): this;

  unsubscribe(func: func): this;

  toChunk(): object|any;
}

declare class View extends BaseInstance {
  readonly _vid: number;
  readonly prefix: string;
  readonly refs: Refs;
  readonly props: AnyObject;

  root?: HTMLElement;

  mount(root: HTMLElement, data?: AnyObject|ModelInstance|AtomInstance): this;

  destroy(withRoot?: boolean): this;

  render(data?: AnyObject|ModelInstance|AtomInstance): this;

  renderToString(data?: AnyObject|ModelInstance|AtomInstance): string;
}

declare class Router extends BaseInstance {
  readonly _rid: number;

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

// model.atom
interface atom {
  (options?: AtomOptions): AtomInstance;
  extend(options: AtomOptions): ExportExtendAtomInstance;
}

// model
interface model {
  (options?: ModelOptions): ModelInstance;
  extend(options: ModelOptions): ExportExtendModelInstance;
  link(linkMethod: string, linkProtoType: string, linkRuntime: string, linkFunc: func, idt?: any): func;
  plugin(options: PluginOptions): PluginInstanceExport;
  atom: atom;
}

// view
interface view {
  (options?: ViewOptions): ViewInstance;
  extend(options: ViewOptions): ExportExtendViewInstance;
  plugin(name: string, options: ViewInstance|ViewOptions|ExportExtendViewInstance|func): ViewOptions|func;
}

// router
interface router {
  (options?: RouterOptions): RouterInstance;
  extend(options: RouterOptions): ExportExtendRouterInstance;
}

// verify
export const verify: VerifyInstance;

// struct
export const struct: AnyObject;

export const router : router;

export const model : model;

export const view: view;

// default cubec{}
declare namespace cubec {
  const model: model;
  const view: view;
  const router: router;
  const struct: AnyObject;
  const verify: VerifyInstance;
}

export default cubec;

