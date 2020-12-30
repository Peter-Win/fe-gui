{
    module: {
        rules: [
            {
                test: <%= extRule %>,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ <%= extensions %> ],
    },
}
