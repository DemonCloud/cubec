const rollup = require('rollup');

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
const optimizeJs = require('rollup-plugin-optimize-js');

const path = require('path');
const inputfile = path.resolve('./') + '/src/cubec.js';
const outputfile = path.resolve('./') + '/dist/cubec.min.js';


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

  await bundle.write({
    file: outputfile,
    sourcemap: false,
    format: 'umd',
    name: 'cubec',
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning); // this requires Rollup 0.46
    }
  });

  return bundle;
};

builder();
