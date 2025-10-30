module.exports = {
  publicPath: "./",
  devServer: {
    port: 8080,
    open: true,
  },
  css: {
    loaderOptions: {
      css: {
        modules: {
          auto: () => false,
        },
      },
    },
  },
};
