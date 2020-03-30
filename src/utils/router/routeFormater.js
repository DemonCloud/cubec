import { rootSign, paramSign, querySign, hashSign } from '../usestruct';

const rootfixer = /^\/+|\/+$/g;

export default function(route, actions=[], id){
  let routeSource;

  if(!route) route = rootSign;

  if(route === rootSign){
    routeSource = {
      id,
      treepath: [rootSign],
      param: [],
      actions
    };
  } else {
    route = (route.split(querySign)[0].split(hashSign)[0]).replace(rootfixer,'');

    const routeParam = [];
    const routePointer = route.
      split(rootSign).
      filter(function(part){ return part; }).
      map(function(part){
        if(part && part[0] === paramSign){
          routeParam.push(part.substr(1));
          return paramSign;
        }

        return part;
      });

    routeSource = {
      id,
      treepath: routePointer,
      param: routeParam,
      actions
    };
  }

  return routeSource;
}

