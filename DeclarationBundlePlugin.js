const { generateDtsBundle } = require('dts-bundle-generator');

class DeclarationBundlePlugin {
  constructor(options = {}) {
    this.name = options.name || '[name].d.ts';
    delete(options.name);
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('DeclarationBundlePlugin', (compilation, callback) => {
      compilation.chunks.forEach((chunk) => {
        const entryModule = chunk.entryModule.rootModule;
        const config = {
          filePath: entryModule.resource,
          libraries: {
            inlinedLibraries: this.options.inlinedLibraries
          }
        }
        const dts = generateDtsBundle([config])[0];
        compilation.assets[this.name] = {
          source() {
            return dts;
          },
          size() {
            return dts.length;
          }
        };
      });
      callback();
    });
  }
}

module.exports = DeclarationBundlePlugin;
