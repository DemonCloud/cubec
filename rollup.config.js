const rollup = require('rollup');

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
const optimizeJs = require('rollup-plugin-optimize-js');

const path = require('path');
const inputfile = path.resolve('./') + '/src/cubec.js';
const outputfile = path.resolve('./') + '/dist/cubec.min.js';

// const modelfile = path.resolve('./') + '/src/model.js';
// const outputmodelfile = path.resolve('./') + '/dist/cubec.model.min.js';

// const viewfile = path.resolve('./') + '/src/view.js';
// const outputviewfile = path.resolve('./') + '/dist/cubec.view.min.js';

// const routerfile = path.resolve('./') + '/src/router.js';
// const outputrouterfile = path.resolve('./') + '/dist/cubec.router.min.js';

// const atomfile = path.resolve('./') + '/src/atom.js';
// const outputatomfile = path.resolve('./') + '/dist/cubec.atom.min.js';


// 定义plugin
const plugins = [
  resolve(),

  commonjs({
    include: 'node_modules/**',
    // namedExports: {
    //   'node_modules/_@ali_app-detector@0.3.0@@ali/app-detector/index.js': [ 'isWeex','isWeb' ]
    // }
  }),

  babel({
    exclude: ['node_modules/**','src/lib/jquery.js'], // only transpile our source code,
    runtimeHelpers: true,
    externalHelpers: true,
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
        },
      ],
    ],
    plugins: [
      '@babel/external-helpers',
      [
        '@babel/transform-runtime',
        {
          regenerator: false
        },
      ],
    ],
  }),
  // 压缩
  uglify.uglify(),

  optimizeJs()
];

const builder = async function() {
  const bundle = await rollup.rollup({
    input: inputfile,
    plugins,
  });

  // const model = await rollup.rollup({
  //   input: modelfile,
  //   plugins,
  // });

  // const view = await rollup.rollup({
  //   input: viewfile,
  //   plugins,
  // });

  // const router = await rollup.rollup({
  //   input: routerfile,
  //   plugins,
  // });

  // const atom = await rollup.rollup({
  //   input: atomfile,
  //   plugins,
  // });

  await bundle.write({
    file: outputfile,
    sourcemap: false,
    format: 'umd',
    name: 'cubec',
    named: 'cubec',
  });

  // await model.write({
  //   file: outputmodelfile,
  //   sourcemap: false,
  //   format: 'umd',
  //   name: 'cubec',
  // });

  // await view.write({
  //   file: outputviewfile,
  //   sourcemap: false,
  //   format: 'umd',
  //   name: 'cubec',
  // });

  // await atom.write({
  //   file: outputatomfile,
  //   sourcemap: false,
  //   format: 'umd',
  //   name: 'cubec',
  // });

  // await router.write({
  //   file: outputrouterfile,
  //   sourcemap: false,
  //   format: 'umd',
  //   name: 'cubec',
  // });

  return bundle;
};

builder();
