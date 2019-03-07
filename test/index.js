import cubec from '../src/cubec';

const root = document.createElement("app");
document.body.appendChild(root);

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

const view = cubec.view({
  root: root,

  render: function(root, data){
    // console.log(root);
    // console.log(data);

    root.innerHTML = `
      <button class="a">${data.str}</button>
      <button class="b">${data.str}</button>
      <a class="router" href="/today/12321/subs", query="a=1&b=2">CLICK ME!</a>
    `;
  },

  events: {
    'click:.a': function(){
      alert(1);
    },

    'click:.b': function(){
      alert(2);
    }
  }
});

r.start();

view.render({ str: 'fuck' });

setTimeout(()=>view.render({ str: "sucker" }), 5000);
