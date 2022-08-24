const target = process.argv[2]
const package = require('../../package.json')
console.log(
  JSON.stringify(
    {
      manifest_version: 2,
      name: 'UG Tabs Offline',
      version: package.version,

      description: 'Ultimate-Guitar.com tab files downloader',

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
