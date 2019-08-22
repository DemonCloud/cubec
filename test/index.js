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

const slot = cubec.view({
  template: `
    <div id="slot">slot1</div>
  `
});

const slot1 = cubec.view({
  components: {
    slot
  },

  template: `
    <div id="slotP">slotP</div>
    <slot>components.slot</slot>
  `
});

const view = cubec.view({
  root: root,

  a: {
    slot1,
  },

  template:`
    <button class="a">{{#str}}</button>
    <button class="b">{{#str}}</button>
    <button id="c">{{#str}}-C</button>
    <label for="abc">DARK</label>
    <br />
    <a class="router" href="/today/12321/subs", query="a=1&b=2">CLICK ME!</a>

    <br />
    <a class="router" href="/today/222", query="c=3&d=4">CLICK ME 2</a>
    <slot>a.slot1</slot>
  `,

  events: {
    'click:.a': function(){
      alert(1);
    },

    'click:.b': function(){
      alert(2);
    },

    'click:#c': function(){
      alert(3);
    }
  }
});

r.start();

view.render({ str: '123' });
setTimeout(()=>view.render({ str: "FUCK" }), 3000);

// 2019 5 10
const model1 = window.m1 =  cubec.model({
  name: "m1",
  url: "/mock1",
});

const model2 = window.m2 = cubec.model({
  name: "m2",
  url: "/mock4",
});

const model3 = window.m3 = cubec.model({
  url: "/mock3",
});

const watom = window.atom = cubec.atom({
  use: [model1, model2, model3],
  connect: true,
});

watom.subscribe(function(data){
  console.log("watom data:", data);
});

window.testModel = cubec.model({
  name: "abcdef",
  url: "/mock1",
  verify: {
    "a" : cubec.verify.isArray
  },
  data: {},
  events: {
    "change": function(data){
      console.log(data);
    },
    "catch:verify": function(){
      console.log("CATCH VERIFY ERROR!", arguments);
    }
  }
});
