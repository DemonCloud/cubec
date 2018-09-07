import './index.css';

import c from '../src/cubec';

window.cubec= c;

let modal = c.model({
  name: 'modal',
  url: ['/mock1','/mock2','/mock3'],

  events: {
    "fetch:success": function(){
      console.log("fetch!", this.get())
    },

    "sync:success": function(){
      console.log("sync!");
    }
  }
});

let xmodal = c.model.extend({
  data: {
    a: [{
      a: "1",
      b: "string",
      c: "pengsihao"
    },{
      a: "2",
      b: "number",
      c: 21332
    },{
      a: "3",
      b: "boolean",
      c: "yes"
    },{
      a: "4",
      b: "function",
      c: "func!"
    },{
      a: "5",
      b: "type",
      c: "this type"
    },{
      a: "6",
      b: "html",
      c: '<b>2</b>'
    },{
      a: "7",
      b: "git flow",
      c: "gitgit"
    },{
      a: "8",
      b: "object",
      c: "{}"
    },],
  },
});

let views = c.view({
  root: document.body,
  name: 'begin',
  connect: modal,

  // directRender: true,

  template: `
  <div ref="cba"></div>
  <table ref="abc" class="main-table">
    <tr>
      {{*each [val] in a }}
      <td>{{#val}}</td>
      {{*/}}
    </tr>
    <tr>
      {{*each [val] in b }}
      <td style="color:#911"><div>{{#val}}</div></td>
      {{*/}}
    </tr>
    <tr>
      {{*each [val] in c }}
      <td>{{#val}}</td>
      {{*/}}
    </tr>
  </table>
  `,

  events: {
    'click:div': function(event) {
      // console.log(event.target);
      this.refs.cba.innerHTML = `<b style="font-size: 28px; color: #931">${
        event.target.textContent
      }</b>`;
    },
  },
});

window.modal = modal;
window.views = views;
window.xmodal = xmodal;
