(() => {
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

  // src/types.ts
  function isDownloadbleFile(file) {
    return !!file.name && !!file.url;
  }

  // src/common/popup.ts
  var Popup = class {
    constructor(_browserAPI) {
      this._browserAPI = _browserAPI;
      this._popupFiles = /* @__PURE__ */ new Map();
      _browserAPI.listenToMessage((event) => {
        if (event.type == "files") {
          this.updateFiles(event.files);
        }
      });
      _browserAPI.sendMessage({ type: "ready" }).then((response) => {
        this.updateFiles(response.files);
      });
    }
    _sendMessage(message) {
      return this._browserAPI.sendMessage(message);
    }
    remove(url) {
      var _a;
      const entry = this._popupFiles.get(url);
      if (entry) {
        (_a = entry.element.parentNode) == null ? void 0 : _a.removeChild(entry.element);
        this._popupFiles.delete(url);
      }
      this._sendMessage({ type: "removeByUrl", url });
    }
    removeAll() {
      var _a;
      for (const { element, file } of this._popupFiles.values()) {
        (_a = element.parentNode) == null ? void 0 : _a.removeChild(element);
        this._sendMessage({ type: "removeByUrl", url: file.url });
      }
      this._popupFiles.clear();
      this.updateFiles(/* @__PURE__ */ new Map());
    }
    updateFiles(files) {
      document.getElementById("content").innerHTML = "";
      const uniqueFiles = Array.from(files.values()).reduce((acc, file) => {
        if (isDownloadbleFile(file)) {
          acc.set(file.url, file);
        }
        return acc;
      }, /* @__PURE__ */ new Map());
      if (uniqueFiles.size) {
        const clearAll = document.createElement("span");
        clearAll.addEventListener("click", () => this.removeAll());
        clearAll.innerText = "clear";
        clearAll.className = "clear";
        document.getElementById("content").appendChild(clearAll);
      }
      Array.from(uniqueFiles.values()).forEach((file) => {
        const blob = new Blob([file.data], { type: "application/octet-stream" });
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const cross = document.createElement("span");
        cross.addEventListener("click", () => this.remove(file.url));
        cross.innerText = "\u{1F7A8}";
        cross.className = "cross";
        const space = document.createTextNode(" ");
        const div = document.createElement("div");
        div.appendChild(cross);
        div.appendChild(space);
        div.appendChild(link);
        document.getElementById("content").appendChild(div);
        link.href = objectURL;
        link.download = file.name;
        link.innerHTML = file.name;
        this._popupFiles.set(file.url, {
          file,
          element: div
        });
      });
    }
  };

  // src/firefox/popup.ts
  new Popup(new FirefoxBrowserAPI());
})();
