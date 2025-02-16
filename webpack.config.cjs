const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");



module.exports = {
    entry: './src/PageFlip.ts',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'page-flip.browser.js',
        library: ['St']
    },
    devtool: 'inline-source-map',
    devServer: {
        compress: true,
        port: 9000,
        hot: true,
        static: {
            directory: path.join(__dirname, 'sample')
        }
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css/,
                use: [{
                        loader: "style-loader"
                    }, {
                        loader: "css-loader"
                    }]
            },
            { 
                test: /\.ts$/, 
                use: 'ts-loader',
                exclude: /node_modules/
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Custom template',
            template: 'sample/index.html'
        })
        /*new CopyPlugin({
            patterns: [
              { from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/*.*'), to: path.resolve(__dirname, 'dist/js/pdfjs-dist/scripts/') },
              { from: path.resolve(__dirname, 'node_modules/pdfjs-dist/cmaps/*.*'), to: path.resolve(__dirname, 'dist/js/pdfjs-dist/cmaps/') },
            ]
        })*/
    ],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    watch: true
};