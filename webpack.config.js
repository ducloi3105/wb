// const path = require('path');
var webpack = require('webpack');
var WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
var BabiliPlugin = require("babel-minify");
var fs = require('fs');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var chalk = require('chalk');

// var MODULES = [
//     'instantarticle',
//     'news',
//     'login',
//     'dashboard',
//     'editnews',
//     'account',
//     'video',
//     'tagmanager',
//     'zonemanager',
//     'liveediting',
//     'threadmanager',
//     'authormanager',
//     'topicmanager',
//     'livesportmanager',
//     'vote',
//     'previewnews',
//     'discussion',
//     'newssourcemanager',
//     'statistic',
//     'boxvideoembed'
//     //'test'
// ];

var BLACKLIST = [
    'test',
    'common'
];
var moduleName='modules_es6'
module.exports = (env) => {
    return {

        entry: (function() {
            var files = fs.readdirSync('./' + moduleName);
            var folders = [];
            files.forEach(function (file) {
                if (fs.existsSync('./' + moduleName + '/' + file + '/app.jsx') && !~BLACKLIST.indexOf(file)) {
                    folders.push(file);
                }
            });

            var obj = {};
            folders.forEach(function (item) {
                obj[item] = __dirname + '/' + moduleName + '/' + item + '/app.jsx';
            });
            return obj;
        })(),

        output: (()=>{
            console.log('=-=============',__dirname);
            return {
                publicPath: __dirname,
                path: __dirname + '/bundles',
                filename: "[name].js"
            }
        })(),

        module: {
            rules: [
                {
                    test: /\.jsx$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["env", "react"]
                        }
                    }
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["env", "react"]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    // use: ExtractTextPlugin.extract({
                    //     publicPath: __dirname + '/../',
                    //     fallback: "style-loader",
                    //     use: "css-loader"
                    // })
                    use: ['style-loader', 'css-loader']
                }
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'create-react-class': 'React.createClass',
            'jquery': 'jQuery'
            // 'lodash': 'lodash'
        },
        // watch: false,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 300
        },
        plugins: (function() {
            var plugins = [
                new ProgressBarPlugin((function() {
                    var buildNo = 0;
                    return {
                        format: `  ${chalk.green.bold('building :percent')}`,
                        callback: function() {
                            buildNo += 1;
                        },
                        summary: false,
                        customSummary: function(buildTime) {
                            var stream = process.stderr;
                            setTimeout(function() {
                                stream.write(chalk.green.bold('Build ' + chalk.cyan.bold(buildNo) + ' completed' + '\n\n'));
                            }, 0);
                        }
                    };
                })()),

                new webpack.optimize.CommonsChunkPlugin({
                    name: "commons",
                    filename: "commons.js",
                    minChunks: function(module, count) {
                        return module.resource
                            && (/React[\/|\\]modules[\/|\\]common/i).test(module.resource) // tách những module ở trong React/modules/common ra thành file vendor riêng
                        // && count >= 3; // nếu được require ở 3 module trở lên sẽ gộp vào file vendor
                    }
                })

            ];
            if (env === 'production') {
                plugins = plugins.concat([
                    new WebpackBundleSizeAnalyzerPlugin(__dirname + '/webpack-bundle-size-report.txt'),
                    new BabiliPlugin()
                ]);
            }
            return plugins;
        })()
    }
};