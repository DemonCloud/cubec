'use strict';

const rollup = require('rollup');

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
// const { minify } = require('uglify-es');

const path = require('path');

// 定义plugin
const plugins = [
  // 寻找node_modules中的模块
  resolve(),
  // CommonJS 转化成 ES6 module
  commonjs({
    include: 'node_modules/**',
    // namedExports: {
    //   'node_modules/_@ali_app-detector@0.3.0@@ali/app-detector/index.js': [ 'isWeex','isWeb' ]
    // }
  }),
  // babel 打包
  babel({
    exclude: "node_modules/**", // only transpile our source code,
    runtimeHelpers: true,
    presets: [
      [
        "env",
        {
          "modules": false
        }
      ]
    ],
    plugins: [
      "external-helpers",
      "transform-class-properties",
      ["transform-object-rest-spread", {useBuiltIns: true}],
      [
        "transform-runtime",
        {
          polyfill: false,
          regenerator: false,
        },
      ],
    ],
  }),
  // 压缩
  uglify(),
];

const inputfile = path.resolve('./')+"/src/c.js";
const outputfile = path.resolve('./')+"/dist/c.min.js";

const builder = async function(){
  const bundle = await rollup.rollup({
    input: inputfile,
    plugins
  });

  await bundle.write({
    file: outputfile,
    format: "umd",
    name: "c",
    // sourcemap: true
  });
};

builder();
