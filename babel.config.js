module.exports = {
  comments: false,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions", "Firefox ESR", "ie 11"],
          ie: "11",
        },
        useBuiltIns: "entry",
        corejs: {
          version: 3,
          proposals: false,
        },
      },
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/transform-async-to-generator",
    "@babel/transform-arrow-functions",
    "@babel/transform-modules-commonjs",
    "@babel/plugin-transform-destructuring",
    "@babel/plugin-transform-parameters",
    ["@babel/plugin-transform-runtime", { corejs: 3 }],
  ],
};
