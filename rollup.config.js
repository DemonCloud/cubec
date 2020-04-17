const path = require('path');
const rollup = require('rollup');

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
// const uglify = require('rollup-plugin-uglify');
// const babel = require('rollup-plugin-babel');
const terser = require('rollup-plugin-terser');
const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const optimizeJs = require('rollup-plugin-optimize-js');
const gzipPlugin = require('rollup-plugin-gzip').default;

const dir = __dirname;
const inputfile = path.join(dir,'/src/cubec.js');
const outputfile = path.join(dir, '/dist/cubec.min.js');

const modelfile = path.join(dir,'/src/part.model.js');
const outputmodelfile = path.join(dir,'/dist/model.min.js');

const viewfile = path.join(dir,'/src/part.view.js');
const outputviewfile = path.join(dir, '/dist/view.min.js');

const routerfile = path.join(dir, '/src/part.router.js');
const outputrouterfile = path.join(dir, '/dist/router.min.js');

// 定义plugin
const plugins = [
  resolve(),

  commonjs({
    include: 'node_modules/**',
    // namedExports: {
    //   'node_modules/_@ali_app-detector@0.3.0@@ali/app-detector/index.js': [ 'isWeex','isWeb' ]
    // }
  }),

  // ES_NEXT -> ES6
  terser.terser({
    parse: {
      ecma: 8,
    },
    // compress: {
    //   ecma: 5,
    //   warnings: false,
    //   comparisons: false,
    //   inline: 2,
    // },
    output: {
      ecma: 5,
      comments: false,
      ascii_only: true,
    },
  }),

  // ES6 -> ES5
  // babel({
  //   exclude: ['node_modules/**'], // only transpile our source code,
  //   runtimeHelpers: true,
  //   externalHelpers: true,
  //   presets: [
  //     [
  //       '@babel/preset-env',
  //       {
  //         modules: false,
  //       },
  //     ],
  //   ],
  //   plugins: [
  //     '@babel/external-helpers',
  //     [
  //       '@babel/transform-runtime',
  //       {
  //         regenerator: false
  //       },
  //     ],
  //   ],
  // }),

  // google closure compiler
  compiler({
    env: "BROWSER",
    // compilation_level: "BUNDLE",
    rewrite_polyfills: "FALSE",
    language_in: "ECMASCRIPT_NEXT",
    language_out: "ECMASCRIPT5"
  }),

  // ES5 -> compress
  // uglify.uglify(),

  // Optimize Compress JS
  optimizeJs(),

  // compress bundle output gz
  gzipPlugin(),
];

const builder = async function() {
  const bundle = await rollup.rollup({
    input: inputfile,
    plugins,
  });

  const model = await rollup.rollup({
    input: modelfile,
    plugins,
  });

  const view = await rollup.rollup({
    input: viewfile,
    plugins,
  });

  const router = await rollup.rollup({
    input: routerfile,
    plugins,
  });

  await bundle.write({
    file: outputfile,
    sourcemap: false,
    format: 'umd',
    name: 'cubec',
    exports: 'named',
  });

  await model.write({
    file: outputmodelfile,
    sourcemap: false,
    format: 'umd',
    name: 'model',
    exports: 'named',
  });

  await view.write({
    file: outputviewfile,
    sourcemap: false,
    format: 'umd',
    name: 'view',
    exports: 'named',
  });

  await router.write({
    file: outputrouterfile,
    sourcemap: false,
    format: 'umd',
    name: 'cubec',
    exports: 'named',
  });

  return bundle;
};

// do building
builder();
