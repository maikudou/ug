(() => {
  // src/types.ts
  function isDownloadbleFile(file) {
    return !!file.name && !!file.url;
  }
  function isDownloadableFileEntry(entry) {
    return isDownloadbleFile(entry[1]);
  }

  // src/firefox/browserAPI.ts
  var FirefoxBrowserAPI = class {
    sendMessage(message) {
      return browser.runtime.sendMessage(message);
    }
    listenToMessage(callback) {
      browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        callback(request, sendResponse);
      });
    }
  };

  // src/firefox/bg.ts
  var browserAPI = new FirefoxBrowserAPI();
  var sendBGToPopupMessage = (message) => {
    return browserAPI.sendMessage(message);
  };
  var files = /* @__PURE__ */ new Map();
  var urlToRequestId = /* @__PURE__ */ new Map();
  function updateFile(requestId, data) {
    files.set(requestId, {
      data: new ArrayBuffer(0),
      finished: false,
      ...files.get(requestId),
      ...data
    });
  }
  function bgFilesToDownloadableFiles(files2) {
    return new Map(Array.from(files2.entries()).filter(isDownloadableFileEntry));
  }
  function removeFileByUrl(url) {
    const requestId = urlToRequestId.get(url);
    if (requestId) {
      files.delete(requestId);
      urlToRequestId.delete(url);
    }
  }
  function onBeforeRequestDataListener(details) {
    let filter = browser.webRequest.filterResponseData(details.requestId);
    filter.onstart = (_event) => {
      updateFile(details.requestId, {
        data: new ArrayBuffer(0),
        finished: false
      });
    };
    filter.ondata = (event) => {
      const file = files.get(details.requestId);
      if (file) {
        const newData = new Uint8Array(file.data.byteLength + event.data.byteLength);
        newData.set(new Uint8Array(file.data), 0);
        newData.set(new Uint8Array(event.data), file.data.byteLength);
        file.data = newData.buffer;
      }
      filter.write(event.data);
    };
    filter.onstop = (_event) => {
      updateFile(details.requestId, {
        finished: true
      });
      checkReady(details.requestId);
      filter.disconnect();
    };
  }
  function checkReady(requestId) {
    const file = files.get(requestId);
    if (file && file.finished && file.name) {
      try {
        sendBGToPopupMessage({
          type: "files",
          files: bgFilesToDownloadableFiles(files)
        }).catch((_) => {
        });
      } catch (_) {
      }
    }
  }
  browser.webRequest.onBeforeRequest.addListener(
    onBeforeRequestDataListener,
    {
      urls: [
        "*://tabs.ultimate-guitar.com/download*",
        "*://tabs.ultimate-guitar.com/tab/download/file*"
      ]
    },
    ["blocking"]
  );
  browser.webRequest.onHeadersReceived.addListener(
    (event) => {
      var _a, _b;
      try {
        const header = event.responseHeaders && ((_a = event.responseHeaders.find(({ name }) => name == "content-disposition")) == null ? void 0 : _a.value);
        if (header) {
          const filename = (_b = /filename=\"(.+)\";/.exec(header)) == null ? void 0 : _b[1];
          updateFile(event.requestId, { name: filename, url: event.url });
        } else {
          const result = /https:\/\/tabs\.ultimate-guitar\.com\/tab\/([^\\]+)\/([^\\]+)/.exec(
            event.documentUrl || ""
          );
          if (result) {
            const [_, band, song] = result;
            updateFile(event.requestId, {
              name: `${band[0].toUpperCase()}${band.slice(1)} - ${song[0].toUpperCase()}${song.slice(1).replace("-", () => " ")}.gp`,
              url: event.url
            });
          } else {
            console.log("Can't find filename");
          }
        }
        urlToRequestId.set(event.url, event.requestId);
        checkReady(event.requestId);
      } catch (e) {
        console.log(e);
      }
    },
    {
      urls: [
        "*://tabs.ultimate-guitar.com/download*",
        "*://tabs.ultimate-guitar.com/tab/download/file*"
      ]
    },
    ["responseHeaders"]
  );
  browserAPI.listenToMessage((request, sendResponse) => {
    switch (request.type) {
      case "ready":
        sendResponse({ type: "files", files: bgFilesToDownloadableFiles(files) });
        break;
      case "removeByUrl":
        removeFileByUrl(request.url);
        break;
    }
  });
})();
