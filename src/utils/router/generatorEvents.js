import urlpatch from './urlpatch';

export default function(router, targets){
  return {
    [`click:${targets}`] : function(event){
      event.preventDefault();

      const routeElm = event.currentTarget;

      // safe parse state
      let state = routeElm.state || routeElm.getAttribute("state") || "{}";

      try{
        state = JSON.parse(state);
      }catch(e){
        console.error(e);
        state = {};
      }

      return router.to(
        urlpatch(routeElm.to || routeElm.href || routeElm.getAttribute("href") || routeElm.getAttribute("to")),
        routeElm.query || routeElm.getAttribute("query") || {},
        state
      );
    }
  };
}
