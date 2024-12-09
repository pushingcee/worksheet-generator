const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    devtool: false, // Disable source maps for production (optional)
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(), // Minify JavaScript
            new CssMinimizerPlugin(), // Minify CSS
        ],
    },
});

