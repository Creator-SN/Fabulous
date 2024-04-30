const { app } = require("electron");
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
    },
    pluginOptions: {    // necessary plugins
        electronBuilder: {
            externals: [
                "fsevents"
            ],
            nodeIntegration: true,
            // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/881
            builderOptions: {
                productName: "Fabulous",
                appId: "com.creatorsn.fabulous",
                afterSign: "scripts/notarize.js",
                win: {
                    icon: "./logo.ico",
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true
                },
                dmg:{
                    sign: false
                },
                mac: {
                    icon: './logo.icns',
                    executableName: "Fabulous",
                    fileAssociations: [
                        {
                            name: "Fabulous Notebook File",
                            ext: "fbn",
                            icon: "./src/assets/notebook.icns",
                            description: "Fabulous Notebook File"
                        }
                    ],
                    hardenedRuntime: true,
                    entitlements: "./build/entitlements.mac.plist",
                    entitlementsInherit: "./build/entitlements.mac.plist",
                    gatekeeperAssess: false
                },
                fileAssociations: [
                    {
                        name: "Fabulous Notebook File",
                        ext: "fbn",
                        icon: "./src/assets/notebook.ico",
                        description: "Fabulous Notebook File"
                    }
                ],
            }
        }
    }
};