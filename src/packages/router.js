import struct from '../lib/struct';
import view from './view';

// Router use HTML5 History API

// author: YiJun

// * use pushState or replaceState
// * onpopstate event only trigger when the History go(+-1) (user trigger)
// * historyStates as a stack [ - - - = - - ]

// *define assert;
// *define history [H]
// *define pathReg to exec

// Default Options
// for merge the keywords
// * example :
//
// new Router({
//   elements: [".router"],

//   routes:{
//     "/": ["home"],
//     "/hifi" : ["hifi"],
//     "/article/:name" : ["article"],
//   },

//   actions:{
//     home: act_home,
//     hifi: act_hifi,
//     article: act_post
//   }
// });

const _ = [],
  H = window.history,
  pathReg = /\/:([^\s/]+)/g,
  mappingReg = '/([^\\s\\/]+)';

// Define Utils [ struct ]
const merge = struct.merge(),
  is = struct.type('def'),
  each = struct.each(),
  map = struct.map(),
  trim = struct.string('trim'),
  keys = struct.keys(),
  slice = struct.slice(),
  cmb = struct.combined(),
  isStr = struct.type('string'),
  isArr = struct.type('array'),
  noop = struct.noop(),
  qstr = struct.param('stringify'),
  toNum = struct.convert('number'),
  clone = struct.cloneDeep(),
  qpars = struct.param('parse');

// About trigger
//  - when refresh browser at router init
//  - when the click binder router-link
//  - when the history go or back (popstate)

// Active the routers
function checkPath(path) {
  return path && path !== location.pathname && path !== location.pathname + '/';
}

function returnT() {
  return true;
}

function toActive(source, path, query, state, notpush, isLink=true, isPopState) {
  let cpath = checkPath(path);

  if (!(isLink && !cpath) && this._status) {
    let _this = this,
      i,
      l,
      checker,
      key = keys(source.mapping),
      route,
      param;
    state = is(state, 'Object') ? state : (isStr(state) ? JSON.parse(state) : {} );

    for (i = 0, l = key.length, checker; i < l; i++)
      if ((checker = source.mapping[key[i]]).test(path)) {
        route = key[i];
        param = cmb(source.params[route], slice(checker.exec(path), 1));
        break;
      }

    // if exist router
    if (route) {
      let queryString = isStr(query)
        ? (query.charAt(0) !== '?' ? '?' : '') + query
        : is(query, 'Object')
          ? '?' + qstr(query)
          : '';

      query = is(query, 'Object') ? query : qpars(query);

      if (source.beforeActions(path, param, query, state)) {
        let names = source.routes[route];

        each(
          map(names, function(name) {
            // setup funtion call
            return source.actions[name] || noop;
          }),
          function(fn) {
            return fn.call(_this, param, query, state);
          },
        );

        if (!notpush)
          H[cpath ? 'pushState' : 'replaceState'](
            state,
            null,
            path + queryString,
          );

        source.completedActions(path, param, query, state);
      }
    }
  }

  return this;
}

const DEFAULT_ROUTER_OPTION = {
  routes: {},
  actions: {},
  beforeActions: returnT,
  completedActions: noop,
};

// Router
class Router {
  constructor(option = {}) {
    const _this = this;
    let source = merge(clone(DEFAULT_ROUTER_OPTION), option);

    // create Assert method
    this._status = 0;
    this._assert = function(idf) {
      if (idf === _) return source;
    };

    let delegatorEvents = {},
      events;

    if (
      (events = map(source.elements, function(elm) {
        return 'click:' + elm;
      }).join('|'))
    ) {
      delegatorEvents[events] = function(e) {
        e.preventDefault();

        const elm = e.currentTarget;

        // click event trigger
        return _this.to(
          elm.to || elm.getAttribute('to') || elm.getAttribute('href'), //path variable
          elm.query || elm.getAttribute('query'), //queryString
          elm.state || elm.getAttribute('state'), //state
          0, //needpush
          1, //isLink
        );
      };

      // create delegatorView on root
      this._delegator = new view({
        root: document.documentElement,
        render: noop,
        events: delegatorEvents,
      });
    }

    source.mapping = {};
    source.params = {};
    source.routes = map(source.routes, function(action) {
      return isArr(action) ? action : [action];
    });

    each(source.routes, function(action, path) {
      let routeParam = [],
        pathMatcher = trim(path).replace(pathReg, function(match, param) {
          routeParam.push(param);
          return mappingReg;
        });
      source.params[path] = routeParam;
      source.mapping[path] = RegExp('^' + pathMatcher + '[/]?$');
    });

    // use location API
    // path : location.pathname
    // query : location.search
    // state : event.state
    window.addEventListener(
      'popstate',
      function(event) {
        return toActive.call(
          this,
          source,
          location.pathname,
          location.search,
          event.state,
          true,
          false,
          true
        );
      }.bind(this),
    );
  }

  to(path, query, state, notpush, isLink) {
    return toActive.call(
      this,
      this._assert(_),
      path,
      query,
      state,
      notpush,
      isLink,
    );
  }

  back() {
    H.back();
    return this;
  }

  go(current) {
    let c = toNum(current);
    if (c) H.go(c);
    return this;
  }

  start(path, query, state) {
    if (this._status) return this;

    this._status = 1;

    if (0 in arguments && path)
      this.to(path, query, state, true, false);

    return this;
  }

  stop() {
    this._status = 0;
    return this;
  }

  resolve(state) {
    if (!this._status) return this;

    H.replaceState(is(state, 'Object') ? state : { _resolveTimeStamp: Date.now() }, null, location.href);
    return this;
  }
}

export default Router;
