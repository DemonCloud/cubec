import cubec from '../src/cubec';

const root = window.rt = document.createElement("div");
document.body.appendChild(root);

const view = cubec.view({
  root: root,
  template: `
    <h1>Hello World</h1>
    <div>
      <b>123</b>
    </div>
  `,

  events: {
    "click:div": function(e){
      this.destroy();
    }
  }
});

view.render();
