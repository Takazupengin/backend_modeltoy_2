module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      // 1. Archivos con la lógica a testear (se sirven como módulos sin auto-ejecutarse)
      { pattern: 'src/data/**/*.js', type: 'module', included: false },
      // 2. Archivo con los 10 tests unitarios
      { pattern: 'src/test/**/*.spec.js', type: 'module' }
    ],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
};