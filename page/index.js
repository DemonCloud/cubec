import c from '../src/c';

window.c = c;

let modal = c.model({
  name: "modal",
  data:{
    a: []
  },
  verify: {
    "a": c.verify.isArray,
  },

  events: {
    "verify:fail": (a,b)=>{
      console.log(a);
      console.log(b);
    }
  }
});

let views = c.view({
  root: document.body,
  model: modal,
  template: `
  <table>
    <tbody>
      {{*each [val] in a }}
      <tr>
        <td>{{#val}}</td>
      </tr>
      {{*/}}
    </tbody>
  </table>
  `,

  events:{
    "click:div": function(e,a){
      console.log(this);
      console.log(e);
      console.log(a);
    }
  }
})

window.modal = modal;
window.views = views;

