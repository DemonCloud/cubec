import struct from '../../lib/struct';
import routeFormater from './routeFormater';

const _eachObject = struct.each('object');
const _eachArray = struct.each('array');
const _isString = struct.type('string');
const _isArray = struct.type('array');

let tid = 1;
const leafSign = '###';

// generator prefix tree
export default function(routes, idmap, existTree={}){
  const tree = existTree;

  _eachObject(routes, function(actions, route){
    if(actions && (_isString(actions) || _isArray(actions))){
      actions = _isString(actions) ? [actions] : actions;

      const id = tid++;
      const path = idmap[id] = routeFormater(route, actions, id);
      const pathEnd = path.treepath.length-1;

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
