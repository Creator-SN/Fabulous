const { notarize } = require('electron-notarize')

exports.default = async function notarizing (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appId = process.env.APP_ID
  const appleId = process.env.APPLE_ID
  const applePassword = process.env.APPLE_PASSWORD
  const teamId = process.env.TEAM_ID

  return await notarize({
    tool:"notarytool",
    appBundleId: appId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: applePassword,
    teamId: teamId
  })
}