var path = require("path");

const resolve = url => {
    return path.join(__dirname, url);
};

module.exports = {
    runtimeCompiler: true,
    css: {
        loaderOptions: {
            scss: {
                prependData: `@import "@/style/global.scss";`
            }
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                "@": resolve("./src")
            },
            extensions: ["*", ".js", ".vue", ".json"]
        },
        externals: ['fsevents'],
    },
    pluginOptions: {    // necessary plugins
        electronBuilder: {
            nodeIntegration: true,
            // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/881
            builderOptions: {
                productName: "Fabulous",
                appId: "com.creatorsn.fabulous",
                win: {
                    icon: "./logo.ico",
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true
                },
                fileAssociations: [
                    {
                        name: "Fabulous Notebook File",
                        ext: "fbn",
                        icon: "./logo.ico",
                        description: "Fabulous Notebook File"
                    }
                ],
            }
        }
    }
};