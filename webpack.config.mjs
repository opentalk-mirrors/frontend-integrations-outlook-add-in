import devCerts from "office-addin-dev-certs";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import DotenvWebpackPlugin from "dotenv-webpack";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

export default async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    optimization: {
      minimize: false,
    },
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      react: ["react", "react-dom"],
      taskpane: {
        import: ["./src/index.tsx", "./src/taskpane/taskpane.html"],
        dependOn: "react",
      },
      commands: {
        import: ["./src/commands/commands.ts", "./src/commands/commands.html"],
        dependOn: "react",
      },
      login: {
        import: ["./src/login/login.tsx", "./src/login/login.html"],
        dependOn: "react",
      },
    },
    target: ["web", "es5"],
    output: {
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          use: "babel-loader",
          exclude: function (modulePath) {
            return /node_modules/.test(modulePath) && !/node_modules\/@mui/.test(modulePath);
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|ttf|woff|woff2|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane", "react"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands", "react"],
      }),
      new HtmlWebpackPlugin({
        filename: "login.html",
        template: "./src/login/login.html",
        chunks: ["login", "react"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
          },
          {
            from: "public/locales",
            to: "locales",
          },
        ],
      }),
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(!dev),
      }),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options:
          env.WEBPACK_BUILD || options.https !== undefined
            ? options.https
            : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3001,
    },
  };

  if (dev) {
    const dotenv = new DotenvWebpackPlugin({
      path: ".env",
      systemvars: true,
    });
    config.plugins.push(dotenv);
  }

  return config;
};
