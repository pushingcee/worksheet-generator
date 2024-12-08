const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/js/scripts.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scripts.js',
        clean: true, 
    },
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/html/index.html',
            inject: 'body', 
        }),
        new MiniCssExtractPlugin({ filename: '[name].css' }), 
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'), 
        },
        port: 8080,
        open: true, 
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    externals: {
        addImage: "addImage"
    }
};
