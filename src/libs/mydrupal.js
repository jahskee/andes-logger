'use strict';

module.exports = (function () {

  // ===== requires =======
  const myutil = require("./myutil")
  const myclicktrack = require("./myclictrack")

  const { useState } = require('./mystate')
  // ===== requires =======

  const [_state] = useState()

  function loadCDNVersion(init) {
    // run the code if in browser
    if (typeof (process.env.REACT_APP_ENV) !== 'undefined') {
      return
    }
    if (typeof window.addEventListener !== 'undefined') {
      try {
        if (typeof window.APP_NAME !== 'undefined') {
          window.addEventListener('load', (event) => {
            (async () => {
              try {
                await init()
                console.log(window.location.href)
                if (_state.remoteConfig.drupal.track_button_click) {
                  console.log2("Track button click - on")
                  myclicktrack.trackButtonClicks()
                } else {
                  console.log2("Track button click - off")
                }
              } catch (error) {
                syslog('loadCDNVersion()', error)
              }
            })()
          })
        }
      } catch (error) {
        syslog('loadCDNVersion()', error)
      }
    }
  }

  return {
    loadCDNVersion
  }

})()