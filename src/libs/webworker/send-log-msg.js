// worker.js
const workercode = () => {
  self.addEventListener('message', function (e) {

    const url = e.data.url
    const msgObj = e.data.data

    postData(url, { data: msgObj }).then((response) => {
      // no op
    }).catch(error => {
      self.postMessage(error);
    })
  }, false);

  // Example POST method implementation:
  function postData(url = '', data = {}) {
    const promise = new Promise((resolve, reject) => {
      // Default options are marked with *
      fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'strict-origin-when-cross-origin', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      }).then(response => {
        resolve("data sent")
        // self.postMessage("data sent")
      }).catch(error => reject(console.log(error)))
    })
    return promise;
  }

}

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
const blob = new Blob([code], { type: "application/javascript" });
const worker = URL.createObjectURL(blob);

module.exports = worker

