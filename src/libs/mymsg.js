'use strict'

module.exports = (function () {

  // ===== requires =======
  const myutil = require('./myutil')
  const axios = require('axios');
  const { useState } = require('./mystate')

  // ===== requires ======= 
  const [_state] = useState()

  let last_msg_hash = ""
  let last_msg_time = (new Date()).getTime()
  // variables to track duplicate messages within 2000 milliseconds

  function prepareMessage(parameters) {

    let params = null
    try {
      params = Array.from(parameters).map(elem => {

        if (elem instanceof Error) {
          // message: [string, object], code: [string], stack [string]
          if (typeof elem.code === 'undefined' || elem.code === null) elem.code = ''
          if (typeof elem.message === 'undefined' || elem.message === null) elem.message = ''
          if (typeof elem.stack === 'undefined' || elem.stack === null) elem.stack = ''

          let code = elem.code
          let message = elem.message
          let stack = elem.stack
          if (stack === "") {
            stack = message
          }

          message = code + " " + message
          message = message.trim()

          if (stack instanceof Object) {
            stack = JSON.stringify(stack)
          }

          let errorObj = { message, stack, type: "error_obj" }

          return errorObj
        } else if (typeof (elem) === 'string') {
          // elem = redactor.redact(elem);
          return { message: elem, type: 'string' }
        } else if (elem instanceof Object) {
          /*
          elem = JSON.stringify(elem)
          elem = redactor.redact(elem);
          elem = JSON.parse(elem)
          */
          return { message: elem, type: 'object' }
        } else {
          return { message: "" + elem, type: "string" }
        }
      })
    } catch (error) {
      syswarn('prepareMessage()', parameters, error)
    }
    return params
  }

  function getUserInfo(version, startTime) {
    let userInfo = {}
    try {
      const osObj = myutil.getOSVersion()
      const browserObj = myutil.getBrowserVersion()

      userInfo = {
        uid: myutil.getUserId(),
        mid: myutil.getMemberId(),
        email: myutil.getEmail(),
        ip: myutil.getIPAddress(),
        loc: myutil.getLocation(),
        os: osObj.name + "-" + osObj.version,
        brw: browserObj.name + "-" + browserObj.version,
        url: window.location.href,
        vfe: version,
        ts: startTime,
        latency_fe: (new Date().getTime()) - startTime,
      }

      delete userInfo.loc.query
    } catch (error) {
      syswarn('getUserInfo()', error)
    }

    return userInfo;
  }

  function checkIfDuplicateMsg(param) { // NOTE: must remain in myfunction.js
    // prevents DOS Attack, dedup message within 500 ms range
    const this_msg_time = (new Date()).getTime()
    const isDuplicate = isDuplicateMsg(param, this_msg_time, 2000)
    // whether duplicate or not this must be set
    last_msg_hash = myutil.hashCode(param)
    last_msg_time = this_msg_time
    return isDuplicate
  }

  function isDuplicateMsg(args, this_msg_time, max_millis) {
    try {
      const new_msg_hash = myutil.hashCode(args)
      if (last_msg_hash === new_msg_hash) {
        const elapsedTime = this_msg_time - last_msg_time
        if (elapsedTime < max_millis) {
          console.warn2('va-logger', 'skipped dup msg, elapsed time: ' + elapsedTime + 'ms, ', ...args)
          return true
        }
      }
    } catch (error) {
      syswarn('isDuplicateMsg()', error)
    }
    return false
  }

  function isOpen(ws) { return ws.readyState === ws.OPEN }

  async function sendMessage(appName, logtype = 'info', startTime, args) {
    //const appName = _state.appName

    let params = prepareMessage(args)
    if (checkIfDuplicateMsg(params)) return // prevents DOS Attack, dedup message within 500 ms range

    const userInfo = getUserInfo(_state.VERSION, startTime)
    const SRE_API_KEY = 'wesalute_temp_apikey'
    let msgObj = {
      appName,
      logtype,
      params,
      secret: SRE_API_KEY,
      user1: userInfo,
    }

    let msgStr = JSON.stringify(msgObj);
    if (_state.RUN_ENV === 'development') {
      msgStr = 'devmode' + msgStr
    } else {
      msgStr = btoa(msgStr)
    }

    // Three tries to send log message
    let myresp = null
    try {
      myresp = await axios.post(_state.remoteConfig.api.fe_msg, { data: msgStr })
      if (![200, 403].includes(myresp.status)) throw Error()
    } catch (error) {
      try {
        myresp = await axios.post(_state.remoteConfig.api.fe_msg, { data: msgStr })
        if (![200, 403].includes(myresp.status)) throw Error()
      } catch (error) {
        myresp = await axios.post(_state.remoteConfig.api.fe_msg, { data: msgStr })
      }
    }
  }

  return {
    getUserInfo,
    sendMessage,
  }

})()