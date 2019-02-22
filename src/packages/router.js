// cubec router next
//
// Author: YiJun
// Date: 2019/2/15
//
// use prefix tree algorithm to path macther
//
// API:
//   to(path, query, state),
//   resolve(state),
//   add(path, actions{}, useaction[]),
//   remove(path)
//   start(),
//   stop(),
//
// example:
//
// cubec.router({
//   target: ".elmclass",
//
//   routes: {
//     '/home': ['home'],
//     '/home/better/': ['better'],
//     '/today/:id/subs: ['today'],
//     '/custom/:id/event/:marked : ['custom']
//   },
//
//   actions: {
//     'home': function,
//     'better': function,
//     'today': function,
//     'custom': function,
//   }
//
//   beforeActions: function,
//
//   events: {
//     completeActions: function,
//     preventActions: function,
//     catch:notmatch: function,
//     catch: function
//   }
// });

import ROUTER from '../constant/router.define';
import defined from '../utils/defined';
import view from './view';

import pathfixer from '../utils/router/pathfixer';
import pathpatch from '../utils/router/pathpatch';
import generatorEvents from '../utils/router/generatorEvents';
import generatorRouteTree from '../utils/router/generatorRouteTree';
import historyActive from '../utils/router/historyActiveAction';
import {
  _idt,
  _define,
  _eachObject,
  _eachArray,
  _merge,
  _isString,
  _isObject,
  _isArray,
  _isFn,
  _paramParse,
  _combined,
  _every,
  _size,
  _extend,
  _eq,
  _on,
  _off,
  _emit,
  _noop
} from '../utils/usestruct';

let rid = 0;

const leafSign = '###';
const paramSign = ':';
const rootSign = '/';

const returnTrue = function(){ return true; };

// Router Class
class Router {
  constructor(config={}){
    config = _merge(ROUTER.DEFAULT_OPTION, config);

    let cache = {};
    let status = false;

    const idmap = {};
    const targets = _isArray(config.targets) ? config.targets.join(",") : config.targets;
    const beforeActions = _isFn(config.beforeActions) ? config.beforeActions : returnTrue;
    const source = {
      idmap,
      tree: generatorRouteTree(config.routes, idmap),
      actions: config.actions
    };

    _eachObject(
      config.events,
      function(event, eventName){ _on(this, eventName, event); },
      defined(this, {
        _rid: rid++,
        _assert: idt => (_idt === idt ? source : {}),
        _status: (idt, change) => ( _idt === idt ? (status=change) : null),
        _idmap: idt => (_idt === idt ? idmap: {}),
        _clear: idt => (_idt === idt ? (cache = {}) : null),
        _b: idt => (_idt === idt ? beforeActions : null),
        _s: idt => (_idt === idt ? status : null),
        _c: idt => (_idt === idt ? cache : {})
      })
    );

    // add global events
    let gfn;
    let gview;
    let gevent;

    addEventListener("popstate", gfn = (event)=>{
      this.__match(
        pathfixer(location.pathname),
        _paramParse(location.search),
        event.state,
        false,  // isResolve
        true,   // isPopState
        false
      );
    });

    // binding DOM events
    if(config.targets && targets){
      gevent = generatorEvents(this);
      gview = new view({
        root: document.documentElement,
        render: _noop,
        events: { [`click:${targets}`]: gevent }
      });
    }

    // end router lifecycle
    this.destory = function(){
      status = false;

      delete this.destory;
      _off.call(this, this);
      removeEventListener('popstate', gfn);

      if(gview) gview.off(`click:${targets}`, gevent);

      return _define(this, "destory", {
        value: false,
        writable: false,
        enumerable: false,
        configurable: false
      });
    };

    _extend(this, config, ROUTER.IGNORE_KEYWORDS);
  }

  // self method match route
  __match(path, query, state, isResolve=false, isPopState=false, isStart=false){
    if(!isStart && (
         !path
      || !this._s(_idt)
      || ((!isPopState && !isResolve) &&
           (rootSign+path) === location.pathname &&
             _eq(query, _paramParse(location.search)))
      || (isResolve && path !== pathfixer(location.pathname))
    )) return this;

    let matchId = false;
    let activepath = pathpatch(path, query);
    let paramValue = [];

    const _cache = this._c(_idt);
    const _source = this._assert(_idt);
    const _tree = _source.tree;
    const _idmap = _source.idmap;
    const _actions = _source.actions;

    // tap cache
    if(_cache[activepath]){
      const args = _cache[activepath];

      historyActive(this,
        activepath,
        args.actions,
        [args.param, args.query, state],
        isResolve,
        isPopState,
        isStart
      );

      return this;
    }

    // isRoot
    if(path === _idt){
      matchId = _tree[rootSign][leafSign];
    }else{
      const pointer = path.split(rootSign);
      const indexEnd = pointer.length - 1;

      if(_size(pointer)){
        let i = 0;
        let l = pointer.length;
        let p = _tree;
        let part;

        for(; i<l; i++){
          part = pointer[i];

          if(p[part]){
            p = p[part];
          }else if(p[paramSign]){
            p = p[paramSign];
            paramValue.push(part);
          }else{
            break;
          }

          if(i === indexEnd){
            matchId = p[leafSign];
          }
        }
      }
    }

    if(matchId = _idmap[matchId]){
      let tapactions = matchId.actions.map(key=>_actions[key]);
      let tapparams = _combined(matchId.param, paramValue);
      let tapargs = [tapparams, query, state];

      historyActive(this,
        activepath,
        tapactions,
        tapargs,
        isResolve,
        isPopState,
        isStart
      );

      _cache[activepath] = { actions: tapactions, param: tapparams, query };
    }else{
      _emit(this,"catch:notmatch",[activepath,query,state]);
    }

    return this;
  }

  // trigger route
  to(path=rootSign, query={}, state={}){
    query = (query && _isString(query)) ? _paramParse(query) : _isObject(query) ? query : {};
    query = _merge(_paramParse(path), query);
    state = _isObject(state) ? state : {};

    return this.__match(pathfixer(path), query, state);
  }

  // add route
  add(route, actions, newAction){
    if(!route || !actions) return this;

    const _source = this._assert(_idt);

    if(newAction && _isObject(newAction) && _every(newAction,a=>_isFn(a)))
      _extend(_source.actions, newAction);

    generatorRouteTree(
      { [route]: actions },
      _source.idmap,
      _source.tree
    );

    this._clear(_idt);

    return this;
  }

  // remove route
  remove(route){
    if(!route) return this;

    const _source = this._assert(_idt);
    const _idmap = _source.idmap;
    const _tree = _source.tree;

    let path = pathfixer(route);

    if(path === _idt){
      if(_tree[rootSign]){
        delete _idmap[_tree[rootSign][leafSign]];
        delete _tree[rootSign][leafSign];
      }
    }else{
      path = path.split(rootSign).map(function(part){
        return part[0] === paramSign ? paramSign : part;
      });
      const pathEnd = path.length - 1;

      let p = _tree;
      _eachArray(path, function(part, index){
        if((p = p[part]) && index === pathEnd){
          if(p[leafSign]){
            delete _idmap[p[leafSign]];
            delete p[leafSign];
          }
        }
      });
    }

    this._clear(_idt);

    return this;
  }

  resolve(state={}){
    return this.__match(
      pathfixer(location.pathname),
      _paramParse(location.search),
      (state && _isObject(state)) ? state : {},
      true,  // isResolve
      false
    );
  }

  start(path, query, state){
    if(_isFn(this.destory)) this._status(_idt, true);

    if(!this.destory || path == null) return this;

    query = (query && _isString(query)) ? _paramParse(query) : _isObject(query) ? query : {};
    query = _merge(_paramParse(path), query);
    state = _isObject(state) ? state : {};

    if(path && _isString(path)){
      const usePath = pathfixer(path);
      this.__match(usePath, query, state, usePath === pathfixer(location.pathname), false);
    }else if(path === false){
      this.__match(pathfixer(location.pathname), _paramParse(location.search), state, false, false, true);
    }

    return this;
  }

  stop(){
    this._status(_idt, false);

    return this;
  }
}

export default Router;
