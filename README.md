# Ultimate-Guitar.com offline tabs

This extension adds the ability to use ultimate-guitar.com tabs offline.

When user visits a tablature's page, the tablature file is downloaded on their machine,
thus, this extension does not provide any more access what user already has.
It merely helps them to easily access the tabs what they already have on their
machine somewhere in the browser cache in a more convenient way.

It intentionally **does not** and will not have have any bulk download functionality.

It **is not** in any way affiliated with ultimate-guitar.com website.

## How to install

### Firefox

1. Download extension zip from the latest release on [https://github.com/maikudou/ug/releases](https://github.com/maikudou/ug/releases).
2. Extaract the archive into any folder on your machine.
3. Open `about:debugging#/runtime/this-firefox` in Firefox.
4. Click "Load Temporary Add-on..."
5. Select `manifest.json` from the folder you've extracted the release archive to.

### Chrome

1. Download extension zip from the latest release on [https://github.com/maikudou/ug/releases](https://github.com/maikudou/ug/releases).
2. Extaract the archive into any folder on your machine.
3. Open `chrome://extensions/` in Chrome.
4. Check "Developer mode" is enabled in the upper right corner of the page
5. Click "Load unpacked" button what should appear after you've enabled "Developer mode"
6. Select folder you've extracted the release archive to, the one which contains `manifest.json` file.

## How to use

After you've installed and enabled (if asked) an extension, you will see extension button near the address bar. You can click it to see extension popup. It will be empty for now.

When you visit any tab page on ultimate-guitar.com, for example [this one](https://tabs.ultimate-guitar.com/tab/metallica/master-of-puppets-official-1938099) extension will add this tab file to the extension popup. Click it and it will be downloaded.

Works with both "Old player" and "New player". If "New player" behaves strangely either use old one or disable extension.
