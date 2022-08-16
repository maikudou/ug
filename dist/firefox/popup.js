(function () {
    'use strict';

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

    function isDownloadbleFile(file) {
        return !!file.name && !!file.url;
    }

    class Popup {
        constructor(_browserAPI) {
            this._browserAPI = _browserAPI;
            this._popupFiles = new Map();
            _browserAPI.listenToMessage(event => {
                if (event.type == 'files') {
                    this.updateFiles(event.files);
                }
            });
            // Each time popup is opened,
            // signal BG page what popup is ready to get files, if any
            _browserAPI
                .sendMessage({ type: 'ready' })
                .then(response => {
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
                (_a = entry.element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(entry.element);
                this._popupFiles.delete(url);
            }
            this._sendMessage({ type: 'removeByUrl', url });
        }
        removeAll() {
            var _a;
            for (const { element, file } of this._popupFiles.values()) {
                (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
                this._sendMessage({ type: 'removeByUrl', url: file.url });
            }
            this._popupFiles.clear();
            this.updateFiles(new Map());
        }
        updateFiles(files) {
            document.getElementById('content').innerHTML = '';
            const uniqueFiles = Array.from(files.values()).reduce((acc, file) => {
                if (isDownloadbleFile(file)) {
                    acc.set(file.url, file);
                }
                return acc;
            }, new Map());
            if (uniqueFiles.size) {
                const clearAll = document.createElement('span');
                clearAll.addEventListener('click', () => this.removeAll());
                clearAll.innerText = 'clear';
                clearAll.className = 'clear';
                document.getElementById('content').appendChild(clearAll);
            }
            Array.from(uniqueFiles.values()).forEach(file => {
                const blob = new Blob([file.data], { type: 'application/octet-stream' });
                const objectURL = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const cross = document.createElement('span');
                cross.addEventListener('click', () => this.remove(file.url));
                cross.innerText = '🞨';
                cross.className = 'cross';
                const space = document.createTextNode(' ');
                const div = document.createElement('div');
                div.appendChild(cross);
                div.appendChild(space);
                div.appendChild(link);
                document.getElementById('content').appendChild(div);
                link.href = objectURL;
                link.download = file.name;
                link.innerHTML = file.name;
                this._popupFiles.set(file.url, {
                    file,
                    element: div
                });
            });
        }
    }

    new Popup(new FirefoxBrowserAPI());

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maXJlZm94L2Jyb3dzZXJBUEkudHMiLCIuLi8uLi9zcmMvdHlwZXMudHMiLCIuLi8uLi9zcmMvY29tbW9uL3BvcHVwLnRzIiwiLi4vLi4vc3JjL2ZpcmVmb3gvcG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1VBQ2EsaUJBQWlCLENBQUE7SUFDNUIsSUFBQSxXQUFXLENBQU8sT0FBVSxFQUFBO1lBQzFCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFlLENBQUE7U0FDMUQ7SUFDRCxJQUFBLGVBQWUsQ0FDYixRQUFrRSxFQUFBO0lBRWxFLFFBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEtBQUk7SUFDdkUsWUFBQSxRQUFRLENBQUMsT0FBWSxFQUFFLFlBQW9DLENBQUMsQ0FBQTtJQUM5RCxTQUFDLENBQUMsQ0FBQTtTQUNIO0lBQ0Y7O0lDRUssU0FBVSxpQkFBaUIsQ0FBQyxJQUFZLEVBQUE7UUFDNUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQTtJQUNsQzs7VUNOYSxLQUFLLENBQUE7SUFvRWhCLElBQUEsV0FBQSxDQUE2QixXQUF1QixFQUFBO1lBQXZCLElBQVcsQ0FBQSxXQUFBLEdBQVgsV0FBVyxDQUFZO0lBbkVuQyxRQUFBLElBQUEsQ0FBQSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUE7SUFvRXpELFFBQUEsV0FBVyxDQUFDLGVBQWUsQ0FBbUIsS0FBSyxJQUFHO0lBQ3BELFlBQUEsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLE9BQU8sRUFBRTtJQUN6QixnQkFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUss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
