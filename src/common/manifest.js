const target = process.argv[2]
const package = require('../../package.json')
console.log(
  JSON.stringify(
    {
      manifest_version: 2,
      name: 'UG Tabs Offline',
      version: package.version,

      description: 'Ultimate-Guitar.com tab files downloader',

      icons: {
        16: 'images/16x16.png',
        32: 'images/32x32.png',
        48: 'images/48x48.png',
        64: 'images/32x32@2x.png',
        96: 'images/48x48@2x.png',
        128: 'images/128x128.png',
        256: 'images/128x128@2x.png'
      },

      background: {
        scripts: ['bg.js']
      },
      ...(target === 'chrome'
        ? {
            content_scripts: [
              {
                matches: ['*://tabs.ultimate-guitar.com/tab/*'],
                js: ['cs.js']
              }
            ]
          }
        : null),
      browser_action: {
        default_title: 'UG Tabs Offline',
        default_popup: 'popup.html'
      },
      permissions: ['*://*.ultimate-guitar.com/*', 'webRequest', 'webRequestBlocking', 'cookies']
    },
    null,
    2
  )
)
