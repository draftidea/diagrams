var path = require('path')
var webpack = require('webpack')

var banner = new webpack.BannerPlugin('Js produced from  typescript compiled by webpack!')

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, './js'),
        filename: 'bundle.js'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', {
                    loader: 'typings-for-css-modules-loader',
                    options: {
                        modules: true,
                        namedExport: true
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    plugins: [
        banner
    ]
}