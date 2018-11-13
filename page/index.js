import cubec from '../dist/cubec.min';
import handlebars from 'handlebars';
import doT from 'dot';
import mustache from 'mustache';

var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var csource = "<p>Hello, my name is {{#name}}. I am from {{#hometown}}. I have " +
             "{{#kids.length}} kids:</p>" +
             "<ul>{{*each [it] in kids}}<li>{{#it.name}} is {{#it.age}}</li>{{*/each}}</ul>";
var dsource = "<p>Hello, my name is {{=it.name}}. I am from {{=it.hometown}}. I have " +
             "{{=it.kids.length}} kids:</p>" +
             "<ul>{{~it.kids :val:index}}<li>{{=val.name}} is {{=val.age}}</li>{{~}}</ul>";

var template = handlebars.compile(source);
var ctemplate = cubec.struct.doom()(csource);
var cctemplate = cubec.struct.doom("cache")(csource);
var dtemplate = doT.template(dsource);

var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};

var i = 0;

setTimeout(function(){
console.time("handlebars")
for(i=0; i<1000; i++){
  var data = { "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  template(data);
}
console.timeEnd("handlebars")

console.time("mustache")
for(i=0; i<1000; i++){
	var data = { "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  mustache.render(source, data);
}
console.timeEnd("mustache")

console.time("doT")
for(i=0; i<1000; i++){
	var data = { "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  dtemplate(data);
}
console.timeEnd("doT")

console.time("cubec")
for(i=0; i<1000; i++){
	var data = { "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  ctemplate(data);
}
console.timeEnd("cubec")

console.time("cubec[cache]")
for(i=0; i<1000; i++){
	var data = { "name": "Alan", "hometown": "Somewhere, TX",
    "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  cctemplate(data);
}
console.timeEnd("cubec[cache]")
}, 2000);

// 连续1000次执行
//doT: 0.814990234375ms
//cubec: 9.39013671875ms
//cubec[cache]: 2.3310546875ms
//mustache: 21.051025390625ms
//handlebars: 24.434814453125ms

//doT: 0.89111328125ms
//cubec: 11.442138671875ms
//cubec[cache]: 2.533935546875ms
//mustache: 19.96484375ms
//handlebars: 17.526123046875ms

//doT: 0.80107421875ms
//cubec: 8.909912109375ms
//cubec[cache]: 2.343994140625ms
//mustache: 25.089111328125ms
//handlebars: 16.114013671875ms

//doT: 0.944189453125ms
//cubec: 10.5517578125ms
//cubec[cache]: 2.462158203125ms
//mustache: 21.616943359375ms
//handlebars: 17.065185546875ms

//doT: 0.819873046875ms
//cubec: 9.61474609375ms
//cubec[cache]: 2.331787109375ms
//mustache: 20.817138671875ms
//handlebars: 16.12890625ms

//doT: 0.9978515625ms
//cubec: 8.794921875ms
//mustache: 20.410888671875ms
//handlebars: 17.98291015625ms

//doT: 0.839208984375ms
//cubec: 7.697021484375ms
//cubec[cache]: 2.741943359375ms
//mustache: 19.64404296875ms
//handlebars: 19.738037109375ms

//doT: 0.81796875ms
//cubec: 8.178955078125ms
//cubec[cache]: 2.26220703125ms
//mustache: 20.93701171875ms
//handlebars: 16.9541015625ms

//doT: 0.997802734375ms
//cubec: 9.683837890625ms
//cubec[cache]: 2.337158203125ms
//mustache: 22.364013671875ms
//handlebars: 21.176025390625ms

//doT: 0.89794921875ms
//cubec: 8.399859375ms
//cubec[cache]: 2.656982421875ms
//mustache: 20.262939453125ms
//handlebars: 16.044189453125ms

// 单次执行
// handlebars: 15.42724609375ms
// mustache: 1.564208984375ms
// cubec[cache]: 0.127197265625ms
// cubec: 0.212890625ms
// doT: 0.031005859375ms

// handlebars: 16.696044921875ms
// mustache: 2.19287109375ms
// cubec[cache]: 0.261962890625ms
// cubec: 0.2998046875ms
// doT: 0.012939453125ms

// handlebars: 16.368896484375ms
// mustache: 1.880859375ms
// cubec[cache]: 0.131103515625ms
// cubec: 0.24560546875ms
// doT: 0.01318359375ms

// handlebars: 10.592041015625ms
// mustache: 2.46728515625ms
// cubec[cache]: 0.19189453125ms
// cubec: 0.428955078125ms
// doT: 0.0078125ms

// handlebars: 16.2958984375ms
// mustache: 2.060791015625ms
// cubec[cache]: 0.119140625ms
// cubec: 0.244140625ms
// doT: 0.013916015625ms

// handlebars: 16.317138671875ms
// mustache: 2.544921875ms
// cubec[cache]: 0.260986328125ms
// cubec: 0.2880859375ms
// doT: 0.01318359375ms

// handlebars: 17.6220703125ms
// mustache: 1.946044921875ms
// cubec[cache]: 0.1298828125ms
// cubec: 0.31884765625ms
// doT: 0.01806640625ms

// handlebars: 18.22998046875ms
// mustache: 1.674072265625ms
// cubec[cache]: 0.150390625ms
// cubec: 0.253173828125ms
// doT: 0.02392578125ms

// handlebars: 15.656982421875ms
// mustache: 1.722900390625ms
// cubec[cache]: 0.174072265625ms
// cubec: 0.340087890625ms
// doT: 0.01513671875ms

// handlebars: 17.111083984375ms
// mustache: 1.928955078125ms
// cubec[cache]: 0.1298828125ms
// cubec: 0.2412109375ms
// doT: 0.013916015625ms

