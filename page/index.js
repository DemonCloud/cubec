import './index.css';

import c from '../src/c';
import model from '../src/packages/model';

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
    a: [6, 8, 9, 11, 23],
  },
});

let views = c.view({
  root: document.body,
  name: 'begin',
  model: modal,

  directRender: true,

  template: `
  <div ref="cba"></div>
  <table ref="abc" class="main-table">
    {{*each [val] in a }}
    <tr>
      <td>{{#val}}</td>
      <td style="color:#188221">
        <div>{{#val+1}}</div>
      </td>
    </tr>
    {{*/}}
  </table>
  `,

  events: {
    'click:div': function(event) {
      // console.log(event.target);
      // this.refs.cba.innerHTML = `<b style="font-size: 28px; color: #931">${
      //   event.target.textContent
      // }</b>`;
    },
  },
});

window.modal = modal;
window.views = views;
window.xmodal = xmodal;
