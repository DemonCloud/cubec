import './index.css';

import c from '../src/cubec';

window.cubec= c;

let modal = c.model({
  name: 'modal',
  url: ['/mock1', '/mock2', '/mock3'],
  // url: ['/mock4'],

  events: {
    "fetch:success": function(source){
      console.log("fetch!", source);
    },

    "fetch:error": function(error){
      // console.log(error);
    },

    "sync:success": function(){
      console.log("sync!");
    }
  }
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
