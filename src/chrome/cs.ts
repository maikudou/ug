import { BGToCSMessage, CSToBGMessage } from '../types'
import { ChromeBrowserAPI } from './browserAPI'
const browserAPI = new ChromeBrowserAPI()

const sendCSToBGMessage = (message: CSToBGMessage) => {
  return browserAPI.sendMessage<CSToBGMessage, BGToCSMessage>(message)
}

browserAPI.listenToMessage<BGToCSMessage>(request => {
  switch (request.type) {
    case 'fileRequest':
      fetch(request.url).then(response => {
        if (response.status == 200) {
          response.arrayBuffer().then(data => {
            sendCSToBGMessage({
              type: 'fileResponse',
              requestId: request.requestId,
              data: Array.from(new Uint8Array(data))
            })
          })
        }
      })
      break
  }
})
