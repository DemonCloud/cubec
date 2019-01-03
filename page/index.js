import cubec from '../src/cubec';

window.cubec = cubec;

const view = cubec.view({
  root: document.body,
  template: `<h1>Hello World</h1>`,
});

view.render();
