/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const buble = require('@rollup/plugin-buble');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const { uglify } = require('rollup-plugin-uglify');


const env = process.env.NODE_ENV || 'development';

const getBundleConfig = function (src, dest) {

    const configMap = {
        input: src,
        plugins: [
            resolve({
                mainFields: ['module', 'jsnext', 'main']
            }),
            json(),
            commonjs({
                exclude: [
                    'node_modules/symbol-observable/es/index.js'
                ]
            }),
            buble({
                objectAssign: 'Object.assign',
                transforms: {
                    dangerousForOf: true
                }
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify(env)
            }),
            env === 'production' && uglify({
                compress: {
                    dead_code: true,
                    drop_console: true
                }
            })
        ],
        watch: {
            chokidar: false
        },
        output: {
            name: 'wdfn',
            file:  dest,
            format: 'iife',
            sourcemap: env !== 'production'
        },
        treeshake: env === 'production'
    };

    if (src == 'src/scripts/networks/index.js' ||
        src == 'src/scripts/wdfn-home/index.js'){
        configMap['external'] = {
           window: 'window'
        };
    }

    return configMap;
};

module.exports = [
    getBundleConfig('src/scripts/index.js', 'dist/bundle.js'),
    getBundleConfig('src/scripts/networks/index.js', 'dist/network-bundle.js'),
    getBundleConfig('src/scripts/wdfn-home/index.js', 'dist/wdfn-bundle.js')
];


