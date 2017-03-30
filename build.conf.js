module.exports = {
    module: {
        name: 'pipDiagrams',
        styles: 'index',
        export: 'pip.diagrams',
        standalone: 'pip.diagrams'
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        sass: true,
        lib: true,
        images: true,
        dist: false
    },
    browserify: {
        entries: [
            './src/index.ts'//,
            //'./temp/pip-webui-diagrams-html.min.js',
        ]
    }, 
    file: {
        lib: [
            '../pip-webui-lib/dist/**/*',
            '../pip-webui-css/dist/**/*',
            '../pip-webui-services/dist/**/*',
            //'../pip-webui-controls/dist/**/*',
           // '../pip-webui-nav/dist/**/*',
            '../pip-webui-layouts/dist/**/*',
           // '../pip-webui-themes/dist/**/*',
           // '../pip-webui-charts/dist/**/*',              
           // '../pip-webui-dates/dist/**/*',             
           // '../pip-webui-locations/dist/**/*'
        ]
    },
    samples: {
        port: 8060
    },
    api: {
        port: 8061
    }
};
