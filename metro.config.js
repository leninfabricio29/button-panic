// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimizaciones para reducir tamaño del bundle
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: false,
    toplevel: false,
    warnings: false,
    ie8: false,
  },
};

// Excluir archivos innecesarios
config.resolver = {
  ...config.resolver,
  blacklistRE: /(node_modules\/.*\/example\/.*|\.backup$)/,
};

module.exports = config;
