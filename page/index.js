import "./index.css";
import cubec from '../dist/cubec.min';

window.cubec = cubec;

const view = cubec.view({
  root: document.body,

  template: `
  <table>
    <thead>
      <th>Template Engine</th>
      <th>Compile time(ms)</th>
      <th>Render time(ms)</th>
      <th>Support cache</th>
      <th>Built-in method</th>
      <th>Virtual DOM</th>
      <th>Refs</th>
    </thead>
    <tbody>
      {{*each [item] in data}}
      <tr>
        <td @data-report-click="213">{{#item.name}}</td>
        <td>{{#item.ct}}</td>
        <td>{{#item.rt}}</td>
        <td><input type="checkbox" {{#item.ca ? "checked" : ""}}></td>
        <td><input type="checkbox" {{#item.bt ? "checked" : ""}}></td>
        <td><input type="checkbox" {{#item.vd ? "checked" : ""}}></td>
        <td><input type="checkbox" {{#item.re ? "checked" : ""}}></td>
      </tr>
      {{*/each}}
    </tbody>
  </table>
  `
});

const data = [
 { name: "cubec", ct: 0.1, rt: 0.2, ca:true, bt: true, vd: true, re: true },
 { name: "handlebars", ct: 1.1, rt: 12.1, ca:true, bt: true, vd: false, re: false },
 { name: "mustache", ct: 0.92, rt: 1.9, ca:true, bt: true, vd: false, re: false },
 { name: "jTemplate", ct: 0.87, rt: 18.1, ca:false, bt: false, vd: false, re: false },
];

view.render({ data });
