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
                mac: {
                    icon: './logo.icns',
                    target: {
                        target: 'dmg',
                        arch: [
                            'x64',
                            'arm64',
                            'universal'
                        ]
                    },
                    fileAssociations: [
                        {
                            name: "Fabulous Notebook File",
                            ext: "fbn",
                            icon: "./src/assets/notebook.icns",
                            description: "Fabulous Notebook File"
                        }
                    ],
                    hardenedRuntime: true,
                    entitlements: "./dist_electron/bundled/entitlements.mac.plist",
                    entitlementsInherit: "./dist_electron/bundled/entitlements.mac.plist",
                    gatekeeperAssess: false,
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