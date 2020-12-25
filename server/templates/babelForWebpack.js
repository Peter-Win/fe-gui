{
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|fe-gui)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
}
