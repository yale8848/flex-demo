module.exports = function(grunt) {

    var path = require('path');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);



    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 35728;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({ port: lrPort });

    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');

    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var lrMiddleware = function(connect, options) {
        return [
            // 把脚本，注入到静态文件中
            lrSnippet,
            // 静态文件服务器的路径 原先写法：connect.static(options.base[0])
            serveStatic(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览) 原先写法：connect.directory(options.base[0])
            serveIndex(options.base[0])
        ];
    };



    const DIR = __dirname; // path.resolve(__dirname, "..");
    var config = {
        tmp: '.tmp',
        src: DIR + '.',
        dist: DIR + '/public'
    };

    const mockTestPath = "./deploy/mock/test.json";
    const mockBuildPath = "./deploy/mock/build.json";


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        less: {
            dist: {
                options: {
                    paths: ['./css'],
                    plugins: [
                        new(require('less-plugin-autoprefix'))({ browsers: ["> 1%", "last 5 versions"] })
                    ],
                },
                files: [{
                    expand: true,
                    dot: true,
                    ext: '.css',
                    cwd: './less',
                    dest: './css',
                    src: [
                        '*.less'
                    ]
                }]
            }
        },

        watch: {
            css: {
                // We watch and compile less files as normal but don't live reload here
                files: ['./less/**/*.less'],
                tasks: ['less'],
            },

            options: {
                livereload: lrPort
            },


            // '**' 表示包含所有的子目录
            // '*' 表示包含所有的文件
            files: ['index.html', './css/*', './js/*', './img/**/*']
        },
        // 通过connect任务，创建一个静态服务器
        connect: {
            options: {
                // 服务器端口号
                port: 8002,
                // 服务器地址(可以使用主机名localhost，也能使用IP)
                hostname: 'localhost',
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: ['./'],
                open: true
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }
        }

    });

    grunt.registerTask('static', [
        'less',
        'connect',
        'watch'
    ]);

    grunt.registerTask('default', 'static');

};