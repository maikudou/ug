console.log(1)

browser.runtime.onMessage.addListener((event) => {
  console.log(event)
  if (event.type == 'files') {
    updateFiles(event.files)
  }
});

browser.runtime.sendMessage({"type": "ready"}).then((response) => {
  updateFiles(response.files)
})

function updateFiles(files) {
  document.getElementById("content").innerHTML = ""
  Array.from(files.values()).forEach(file => {
    const blob = new Blob( file.data, { type: 'application/octet-stream' } );
    const objectURL = URL.createObjectURL( blob );
    // console.log(objectURL)

    const link = document.createElement('a');

    const div = document.createElement('div');
    div.appendChild(link)

    document.getElementById("content").appendChild( div );

    link.href = objectURL;
    link.download = file.name;
    link.innerHTML = file.name
  })
}