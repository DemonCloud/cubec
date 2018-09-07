import './index.css';

import c from '../src/cubec';

window.c = c;

let modal = c.model({
  name: 'modal',
  data: {
    a: [],
  },
  verify: {
    a: c.verify.isArray,
  },

  events: {
    'verify:fail': (a, b) => {
      console.log(a);
      console.log(b);
    },
  },
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

  // directRender: true,

  template: `
  <div ref="cba"></div>
  <table ref="abc" class="main-table">
    {{*each [val] in a }}
    <tr>
      <td>{{#val.a}}</td>
      <td style="color:#188221">
        <div>{{#val.b}}</div>
      </td>
      <td>{{-val.c}}</td>
    </tr>
    {{*/}}
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
