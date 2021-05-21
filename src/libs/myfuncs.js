'use strict';

module.exports = (function() {
  // ===== requires =======
  const mymsg = require('./mymsg')
  const myutil = require("./myutil")
  const { useState } = require('./mystate')
  // ===== requires =======

  function createLogFuncs(Sentry = null) {
    const [ _state ] = useState()

    // const worker_script = require("./webworker/send-log-msg")
    console.log2 = console.log;
    console.warn2 = console.warn;
    console.info2 = console.info;
    console.error2 = console.error;

    // webworker to send the log message
    /*
    var worker = new Worker(worker_script);
    worker.onmessage = function(e) {}
    worker.onerror = function(e) {}
    */

    const funcInfo = async function () {
      try {
        const startTime = new Date().getTime()

        try {
          if (_state.RUN_ENV === 'development') {
            console.info2(...arguments);
          }
        } catch(error) {
          //no-op
        }

        // block some text here
        if (typeof arguments[0] === 'string') {
          if (_state.appName.startsWith("Milvet")) {
            if (arguments[0].length > 10) {
              if (arguments[0].startsWith("xc_partner_login")) {
                return
              }
            }
          }
        }
        const appName = _state.appName
        mymsg.sendMessage(appName, 'info', startTime, arguments) // don't await
      } catch (error) {
        console.error2(error)
      }
    }

    const funcWarn = async function () {
      try {
        const startTime = new Date().getTime()
  
        try {
          if (_state.RUN_ENV === 'development') {
            console.warn2(...arguments);
          }
        } catch(error) {
          // no-op
        }
        const appName = _state.appName
        mymsg.sendMessage(appName, 'warn', startTime, arguments)
      } catch (error) {
        console.error2(error)
      }
    }

    const funcError = async function () {
      try {
        const startTime = new Date().getTime()
        try {
          if (_state.RUN_ENV === 'development') {
            console.error2(...arguments);
          }
        } catch(error) {
          // no-op
        }
        const appName = _state.appName
        mymsg.sendMessage(appName, 'error', startTime, arguments) // don't await
        myutil.sendToSentry(Sentry, arguments)
      } catch (error) {
        console.error2(error)
      }
    }

    /* ======= Start of Internal Loggers ========== */
    const funcSysLog = async function () {
      try {
        if (!_state.remoteConfig.debug.syslog_enabled) return
        const args = ["debug:", ...arguments]

        const startTime = new Date().getTime()

        try {
          if (_state.RUN_ENV === 'development') {
            console.log2(...args);
          }
        } catch(error) {
          // no-op
        }
        const appName = "Sys-"+_state.appName
        mymsg.sendMessage(appName, 'info', startTime, args) // don't await
      } catch (error) {
        console.error2(error)
      }
    }

    const funcSysWarn = async function () {
      try {
        if (!_state.remoteConfig.debug.syswarn_enabled) return
        const args = ["debug:", ...arguments]

        const startTime = new Date().getTime()
        
        try {
          if (_state.RUN_ENV === 'development') {
            console.warn2(...args);
          }
        } catch(eror) {
          // no-op
        }
        const appName = "Sys-"+_state.appName
        mymsg.sendMessage(appName, 'warn', startTime, args) // don't await
      } catch (error) {
        console.error2(error)
      }
    }

    return {
      funcInfo,
      funcWarn,
      funcError,
      funcSysLog,
      funcSysWarn,
    }

  }

  return createLogFuncs

})()