import urlpatch from './urlpatch';

export default function(router){
  return function(event){
    event.preventDefault();

    const routeElm = event.currentTarget;
    const query = routeElm.query || routeElm.getAttribute("query") || {};
    const path = urlpatch(routeElm.to || routeElm.href || routeElm.getAttribute("href") || routeElm.getAttribute("to"));

    // safe parse state
    let state = routeElm.state || routeElm.getAttribute("state") || "{}";

    try{
      state = JSON.parse(state);
    }catch(e){
      console.error(e);
      state = {};
    }

    return router.to(
      path,
      query,
      state
    );
  };
}
