(function () {
    'use strict';

    function isDownloadbleFile(file) {
        return !!file.name && !!file.url;
    }
    function isDownloadableFileEntry(entry) {
        return isDownloadbleFile(entry[1]);
    }

    class FirefoxBrowserAPI {
        sendMessage(message) {
            return browser.runtime.sendMessage(message);
        }
        listenToMessage(callback) {
            browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
                callback(request, sendResponse);
            });
        }
    }

    const browserAPI = new FirefoxBrowserAPI();
    const sendBGToPopupMessage = (message) => {
        return browserAPI.sendMessage(message);
    };
    const files = new Map();
    const urlToRequestId = new Map();
    function updateFile(requestId, data) {
        files.set(requestId, Object.assign(Object.assign({ data: new ArrayBuffer(0), finished: false }, files.get(requestId)), data));
    }
    function bgFilesToDownloadableFiles(files) {
        return new Map(Array.from(files.entries()).filter(isDownloadableFileEntry));
    }
    function removeFileByUrl(url) {
        const requestId = urlToRequestId.get(url);
        if (requestId) {
            files.delete(requestId);
            urlToRequestId.delete(url);
        }
    }
    /*
     * Firefox can read requests bodies, so we can
     * store tab files to be downloaded later if needed
     */
    function onBeforeRequestDataListener(details) {
        let filter = browser.webRequest.filterResponseData(details.requestId);
        filter.onstart = _event => {
            updateFile(details.requestId, {
                data: new ArrayBuffer(0),
                finished: false
            });
        };
        filter.ondata = event => {
            const file = files.get(details.requestId);
            if (file) {
                const newData = new Uint8Array(file.data.byteLength + event.data.byteLength);
                newData.set(new Uint8Array(file.data), 0);
                newData.set(new Uint8Array(event.data), file.data.byteLength);
                file.data = newData.buffer;
            }
            filter.write(event.data);
        };
        filter.onstop = _event => {
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
                    type: 'files',
                    files: bgFilesToDownloadableFiles(files)
                }).catch(_ => { });
            }
            catch (_) { }
        }
    }
    // Attach data processor for all requests what look like a tab file
    browser.webRequest.onBeforeRequest.addListener(onBeforeRequestDataListener, {
        urls: [
            '*://tabs.ultimate-guitar.com/download*',
            '*://tabs.ultimate-guitar.com/tab/download/file*'
        ]
    }, ['blocking']);
    browser.webRequest.onHeadersReceived.addListener(event => {
        var _a, _b;
        try {
            const header = event.responseHeaders &&
                ((_a = event.responseHeaders.find(({ name }) => name == 'content-disposition')) === null || _a === void 0 ? void 0 : _a.value);
            if (header) {
                // For "old" player they have content-disposition header
                // what has filename in it
                const filename = (_b = /filename=\"(.+)\";/.exec(header)) === null || _b === void 0 ? void 0 : _b[1];
                updateFile(event.requestId, { name: filename, url: event.url });
            }
            else {
                // For "new" player they don't have such header,
                // we have to try to extract file name from the URL
                const result = /https:\/\/tabs\.ultimate-guitar\.com\/tab\/([^\\]+)\/([^\\]+)/.exec(event.documentUrl || '');
                if (result) {
                    const [_, band, song] = result;
                    updateFile(event.requestId, {
                        name: `${band[0].toUpperCase()}${band.slice(1)} - ${song[0].toUpperCase()}${song
                        .slice(1)
                        .replace('-', () => ' ')}.gp`,
                        url: event.url
                    });
                }
                else {
                    console.log("Can't find filename");
                }
            }
            urlToRequestId.set(event.url, event.requestId);
            checkReady(event.requestId);
        }
        catch (e) {
            console.log(e);
        }
    }, {
        urls: [
            '*://tabs.ultimate-guitar.com/download*',
            '*://tabs.ultimate-guitar.com/tab/download/file*'
        ]
    }, ['responseHeaders']);
    // Listen for popup messages
    browserAPI.listenToMessage((request, sendResponse) => {
        switch (request.type) {
            case 'ready':
                sendResponse({ type: 'files', files: bgFilesToDownloadableFiles(files) });
                break;
            case 'removeByUrl':
                removeFileByUrl(request.url);
                break;
        }
    });

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy50cyIsIi4uLy4uL3NyYy9maXJlZm94L2Jyb3dzZXJBUEkudHMiLCIuLi8uLi9zcmMvZmlyZWZveC9iZy50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY00sU0FBVSxpQkFBaUIsQ0FBQyxJQUFZLEVBQUE7UUFDNUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQTtJQUNsQyxDQUFDO0lBRUssU0FBVSx1QkFBdUIsQ0FDckMsS0FBdUIsRUFBQTtJQUV2QixJQUFBLE9BQU8saUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDcEM7O1VDckJhLGlCQUFpQixDQUFBO0lBQzVCLElBQUEsV0FBVyxDQUFPLE9BQVUsRUFBQTtZQUMxQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBZSxDQUFBO1NBQzFEO0lBQ0QsSUFBQSxlQUFlLENBQ2IsUUFBa0UsRUFBQTtJQUVsRSxRQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxLQUFJO0lBQ3ZFLFlBQUEsUUFBUSxDQUFDLE9BQVksRUFBRSxZQUFvQyxDQUFDLENBQUE7SUFDOUQsU0FBQyxDQUFDLENBQUE7U0FDSDtJQUNGOztJQ0hELE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQTtJQUMxQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsT0FBeUIsS0FBSTtJQUN6RCxJQUFBLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBcUMsT0FBTyxDQUFDLENBQUE7SUFDNUUsQ0FBQyxDQUFBO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUE7SUFDdkMsTUFB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
