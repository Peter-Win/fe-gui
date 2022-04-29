{
    module: {
        rules: [
            {
                test: <%= extRule %>,
                use: {
                    loader: '<%= loader %>',
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ <%= extensions %> ],
    },
}
