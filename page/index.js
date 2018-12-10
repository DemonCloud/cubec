import "./index.css";
import cubec from '../src/cubec';

window.cubec = cubec;

var model1 = cubec.model({ name:"m1", data: {a:1} });
var model2 = cubec.model({ name:"m2", data: {b:2} });
var model3 = cubec.model({ name:"m3", data: {c:3} });
var model4 = cubec.model({
  data: {
    modify: [{ a:1, b: 2, c: 3}, { a: 2, c:4, d: 3}, { c: 2}],
    chunk: { a:3, b:2, c:[{a:4},{b:2,a:5},{c:4},{b:4}], d:{ b: 6, a:7 } },
    a:6,
    b:1
  }
});

var atom = cubec.atom({
  use: [model1, model2, model3],

  connect: true,
});

var view = cubec.view({
  root: document.body,
  connect: atom,
  template: `
  <div>m1: {{#JSON.stringify(m1)}}</div>
  <div>m2: {{#JSON.stringify(m2)}}</div>
  <div>m3: {{#JSON.stringify(m3)}}</div>
  `,

  events: {
  }
});

window.model1 = model1;
window.model2 = model2;
window.model3 = model3;
window.model4 = model4;
window.atom = atom;
window.view = view;
