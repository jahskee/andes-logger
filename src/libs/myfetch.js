'use strict';

module.exports = (function () {

  // ===== requires =======
  const myutil = require("./myutil")
  const { useState } = require('./mystate')
  // ===== requires =======

  var myglobal = myutil.getGlobal()
  const [ _state ] = useState()

  var fetch2 = fetch

  function updatePostBody_withUserContext(postBody, vauser) {
    postBody = { ...postBody, vauser }
    return postBody
  }

  async function extendFetch() {
    try {

      let args = arguments

      // guard logic
      if (!args[0].includes("cloudfunctions.net")) {
        return await fetch2.apply(window, args)
      }

      if (args.length > 1) {
        try {
          if (args[1].method.toUpperCase() === "POST") {
            // if args[1].body is defined
            if (typeof (args[1].body) !== 'undefined' || args[1].body !== null) {

              let postBody = JSON.parse(args[1].body)
              if (typeof (postBody.data) === 'undefined' || postBody.data === null) {
                postBody.data = {}
              }

              postBody.data.vauser99k = _state.VAUSER
              args[1].body = JSON.stringify(postBody)
            }
          }

        } catch (error) {
          syswarn(error)
        }

      } else {
        /*
        if (args[1].method.toUpperCase() === "POST") {
          let postBody = { data: {} }
          postBody.data = { vauser: global.VAUSER }
          args[1].body = JSON.stringify(postBody)
        } 
        */
      }

      return await fetch2.apply(window, args)
    } catch (error) {
      Promise.reject(error)
    }
  }

  return {
    updatePostBody_withUserContext,
    extendFetch
  }

})()