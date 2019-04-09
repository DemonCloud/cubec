import cubec from '../src/cubec';

const root = document.createElement("app");
document.body.appendChild(root);

const qs = "?transNo=e7e04a5fd30b4562a4a6a41d20969fa3|b1166c4a3e734c0db73a8d75ab6cccc0&merchantsNo=0123685382&payChannelType=alipay_form_wap&charset=UTF-8&out_trade_no=e7e04a5fd30b4562a4a6a41d20969fa3&method=alipay.trade.wap.pay.return&total_amount=0.01&sign=FyxWrwcz%2Fv7ORK17W0OTTXI6dr3hnszQ1u7Rnys3%2BO1DvS5vfstoFELr6J%2F1JDzHOsJQht433S2ay4bfxUl6uqXDS1jC8sR6UBcg3%2B%2BIRRt4%2Bc8sC%2BeTEVxcIGncZjRx16mB0VAD%2Fk0JzTOmNUWuVE1BicXVolXY1EIV1y6vq0KBhko98E3f14bj3nhBsrBBTOSq3w1Ay2e8hLRiwR4DhbclgdfKdQO8rAph6D%2BKYOtXafhb7s%2FLtYuIyE6NEG%2FK7nGffsVrEsD8VOzfh3g5wlBYCmffeNog7SPkFfpk3i%2B8QxhWzqvApEbvthTuDSENN6Mx4TjhzIfOujzVLo3Uww%3D%3D&trade_no=2019032322001407661022959071&auth_app_id=2017022705924750&version=1.0&app_id=2017022705924750&sign_type=RSA2&seller_id=2088421463468675&timestamp=2019-03-23+15%3A53%3A27";

console.log(cubec.struct.param("parse")(qs));

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
      <button id="c">${data.str}-C</button>
      <a class="router" href="/today/12321/subs", query="a=1&b=2">CLICK ME!</a>
    `;
  },

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

view.render({ str: 'fuck' });

setTimeout(()=>view.render({ str: "sucker" }), 5000);
