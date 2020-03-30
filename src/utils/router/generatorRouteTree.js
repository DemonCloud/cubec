import routeFormater from './routeFormater';
import {
  _eachObject,
  _eachArray,
  _isString,
  _isArray,
  leafSign,
} from '../usestruct';

let tid = 1;

// generator prefix tree
export default function(routes, idmap, existTree={}){
  const tree = existTree;

  _eachObject(routes, function(actions, route){
    if(actions && (_isString(actions) || _isArray(actions))){
      actions = _isString(actions) ? [actions] : actions;

      const id = tid++;
      const path = idmap[id] = routeFormater(route, actions, id);
      const pathEnd = path.treepath.length - 1;

      if(pathEnd > -1){
        let parent = tree;

        _eachArray(path.treepath, function(part, index){
          // create tree node
          if(index === pathEnd) parent[part] = { [leafSign] : id };

          if(!parent[part]) parent[part] = {};

          parent = parent[part];
        });
      }
    }
  });

  return tree;
}

