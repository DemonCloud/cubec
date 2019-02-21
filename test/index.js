import cubec from '../src/cubec';

const r = window.router = cubec.router({
  targets: ".router",

  routes: {
    '/': ['root'],
    '/home': ['home'],
    '/home/better/': ['better'],
    '/:id/tree': ['custom'],
    '/today/:id': ['today'],
    '/today/:id/subs': ['custom'],
    '/custom/:id/event/:marked': ['custom']
  },

  actions: {
    'root': function(){
      console.log("root");
    },
    'home': function(){},
    'better': function(){},
    'today': function(){},
    'custom': function(param,query,state){
      console.log(param, query);
    },
  },

  events: {
    catch(){
      console.log("catch");
    },

    'catch:notmatch': function(path){
      console.log("notmatch", path);
    },

    'completeActions': function(path){}
  }
});

r.start('/custom/213/event/1');

const view = cubec.view({
  root: document.body,
  template: `
    <a class="router" href="/today/abc/subs">/toady/abc/subs</a>
  `
});

view.render();
