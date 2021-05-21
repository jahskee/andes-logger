'use strict';

module.exports = (function() {

  // ===== requires =======
  const axios = require('axios');
  const detectPlatforrm = require("./myplatform")
  // const { SyncRedactor } = require('redact-pii');
  const isIp = require('is-ip');
  const validator = require("email-validator");
  const us_states = require('../data/us_states')
  const md5 = require('md5');
  const { useState } = require('./mystate')
  const pick = require('lodash.pick');
  //const local_config = require('../../conf/local_config');
  // ===== requires =======
  
  const [ _state ] = useState()

  let myglobal = getGlobal()

  function getGlobal() {
    let retGlobal = null

    if (typeof window !== 'undefined') {
      retGlobal = window
    } else if (typeof globalThis !== 'undefined') {
      retGlobal = global
    } else if (typeof global !== 'undefined') {
      retGlobal = globalThis
    }

    if (retGlobal === null) {
      sysLog('myglobal is null')
    }
    return retGlobal
  }

  function setUserId() {
    _state.USER_ID = generateUserId()
    if (!_state.IS_PRIVATE_BROWSING) {
      if (localStorage.getItem("vaUserId") === null) {
        localStorage.setItem("vaUserId", _state.USER_ID)
      }
    }
  }

  function getUserId() {
    let userId = _state.USER_ID
    if (!_state.IS_PRIVATE_BROWSING) {
      userId = localStorage.getItem('vaUserId') || ''
    }
    return userId
  }

  function getMemberId() {
    let memberId = _state.MEMBER_ID
    if (!_state.IS_PRIVATE_BROWSING) {
      memberId = localStorage.getItem('vaMemberId') || ''
    }
    return memberId
  }

  function getOSVersion() {
    let osVersion = { name: "", version: "" }
    try {
      osVersion = _state.PLATFORM_OS
    } catch (error) {
      syswarn('getOSVersion()', error)
    }
    return osVersion
  }

  function getBrowserVersion() {
    let brwVersion = { name: "", version: "_" }
    try {
      brwVersion = _state.PLATFORM_BROWSER
    } catch (error) {
      syswarn('getBrowserVersion()', error)
    }
    return brwVersion
  }

  async function fetchRemoteConfig() {
    
    let URL_GET_CONFIG = `https://us-central1-engineeringops-sre.cloudfunctions.net/sre-conf-prod`
    if (_state.RUN_ENV === 'development') {
      URL_GET_CONFIG = `https://us-central1-engineeringops-sre.cloudfunctions.net/sre-conf-dev`
    }

    const SRE_API_KEY = "wesalute_temp_apikey"
    // encode message      
    const msgObj = btoa(JSON.stringify({ secret: SRE_API_KEY }))

    const res = await axios.post(URL_GET_CONFIG, { data: msgObj })
    const config = res.data

    // if in dev mode, merge with local configuration
    if (_state.RUN_ENV === 'development') {
      // config = {...config, ...local_config}
    }

    return config
  }

  async function setIPAddress() {
    let URL_GET_IP = `https://us-central1-engineeringops-sre.cloudfunctions.net/ip-msg-prod`
    if (_state.RUN_ENV === 'development') {
      URL_GET_IP = `https://us-central1-engineeringops-sre.cloudfunctions.net/ip-msg-dev`
    }

    const SRE_API_KEY = "wesalute_temp_apikey"
    // encode message      
    const msgObj = btoa(JSON.stringify({ secret: SRE_API_KEY }))

    const res = await axios.post(URL_GET_IP, { data: msgObj })

    return res.data.ip
  }

  function getIPAddress() {
    if (isIp(_state.IP_ADDRESS)) {
      const ipaddress = btoa(_state.IP_ADDRESS) // + getRandomChar()
      _state.IP_ADDRESS = ipaddress
    }
    return _state.IP_ADDRESS
  }

  function getEmail() {
    let email = _state.EMAIL
    if (!_state.IS_PRIVATE_BROWSING) {
      email = localStorage.getItem('vaEmail') || ''
    }
    // TODO: temporary this can be removed later by Jun, 2021
    if (validator.validate(email)) {
      email = btoa(email)
    }

    return email
  }

  function getUserContext() {
    return `user[uid: ${getUserId()}, mid: ${getMemberId()}]`
  }

  function getLogType(msgObj1, msgObj2) {
    let logtype = "info"
    if (msgObj1.logtype === "error") logtype = "error"
    if (msgObj2.logtype === "error") logtype = "error"
    return logtype
  }

  function generateUserId() {
    let uid = ''
    try {
      const d = new Date();
      const n = d.getTime();
      const num = parseInt((Math.random() * 1000), 10)
      uid = "US" + ("" + n).vaHashCode() + num
      if (uid !== null) {
        if (typeof (uid.length) !== 'undefined') {
          // this will be enhanced later using loop
          if (uid.length === 12) {
            uid = uid + "0"
          } else if (uid.length == 11) {
            uid = uid + "00"
          } else if (uid.length == 10) {
            uid = uid + "000"
          }
        }
      }
    } catch (error) {
      syswarn('generateUserId()', error)
    }

    return uid
  }

  function sendToSentry(Sentry = "", params = "") {
    try {
      if (process.env.REACT_APP_ENV !== 'production') {
        return
      }

      if (typeof (Sentry) === "string") {
        syswarn('Sentry must not be of string type.')
        return
      }
      if (arguments.length < 2) {
        syswarn('Sentry func parameters must be greater than 2.')
        return
      }

      Array.from(params).forEach((elem, index) => {

        // When error found, send to Sentry.io
        if (elem instanceof Error) {
          try {
            if (typeof (elem.code) === 'undefined' || elem.code === null) {
              elem.code = ""
              if (elem.message.length < 150) {
                elem.message = elem.message + ", " + getUserContext()
              } else {
                elem.message = getUserContext() + ", " + elem.message
              }
            }

            if (typeof (elem.stack) !== 'undefined' && elem.stack !== null) {
              elem.stack = elem.stack + ", " + getUserContext()
              Sentry.captureException(elem)
            } else {
              syswarn('Cannot send empty stack to sentry.', error)
            }

          } catch (error) {
            syswarn('Error sending to sentry.', error)
          }
        }
      })
    } catch (error) {
      syswarn('sendToSentry()', error)
    }
  }

  function definePolyFill() {

    // Polyfill String.vaHashCode(...)
    if (typeof ("test_string".vaHashCode) === 'undefined') {
      Object.defineProperty(String.prototype, 'vaHashCode', {
        value: function () {
          var hash = 0, i, chr;
          for (i = 0; i < this.length; i++) {
            chr = this.charCodeAt(i);
            hash = ((hash << 2) - hash) + chr;
            //hash |= 0; // Convert to 32bit integer
          }
          return hash;
        }
      });
    }

    // Polyfill String.contains(...), for older browser
    if (!String.prototype.contains) {
      String.prototype.contains = function () {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }
  }

  function hashCode(param) {
    return md5(JSON.stringify(param))
  }

  function startPerf() {
    return new Date().getTime()
  }

  function endPerf(start) {
    const elapsed = (new Date().getTime()) - start
    return console.log2("delay: " + elapsed)
  }

  function getAppSuffix(appEnv) {
    let appSuffix = ''

    try {
      if (appEnv === 'production') {
        appSuffix = "-PROD"
      } else if (appEnv === 'development') {
        appSuffix = "-DEV"
      } else if (appEnv === 'test') {
        appSuffix = "-STG"
      } else {
        appSuffix = "-Invalid-Environment"
      }
    } catch (error) {
      syswarn('getAppSuffix()', error)
    }

    return appSuffix
  }

  function detectOSAndBrowser() {
    try {
      const myplatform = detectPlatforrm()
      _state.PLATFORM_OS = myplatform.os
      _state.PLATFORM_BROWSER = myplatform.browser
    } catch (error) {
      syswarn('detectOSAndBrowser()', error)
    }
  }

  function delay(delayInms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  }

  // these variables are set in Drupal 
  function getDrupalName() {
    let drupalName = ""
    if (typeof window.APP_NAME !== 'undefined') {
      drupalName = window.APP_NAME
    }
    return drupalName
  }

  function getDrupalEnv() {
    let drupalEnv = ""
    if (typeof (window.APP_ENV) !== 'undefined') {
      drupalEnv = window.APP_ENV
    }
    return drupalEnv
  }

  function isPrivateBrowsing() {
    let isPrivate = false
    try {
      localStorage.setItem("safeMode", false)
    } catch (error) {
      isPrivate = true
    }
    return isPrivate
  }

  function getLocation() {
    return _state.LOCATION || {}
  }

  async function fetchLocationAPI() {
    let location = { country: '', city: '', state: '' }
    try {
      const resp = await axios({
        url: 'https://extreme-ip-lookup.com/json',
        method: 'get'
      })
      location = resp.data
      location = pick(location, ['countryCode', 'region', 'city', 'query'])
      location.country = location.countryCode
      if (location.country === 'US') {
        location.state = us_states.getStateAbbr(location.region)
      } else {
        location.state = location.region
      }
      delete location.region
      //location.lat = btoa(location.lat) + getRandomChar()
      // location.lon = btoa(location.lon) + getRandomChar()
      delete location.countryCode

    } catch (error) {
      syswarn('unable to fetch location', error)
      return null
    }
    return location
  }

  function getRandomChar(length = 1) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*!@#$%^&*';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function list2map(mylist) {
    const mymap = new Map()
    mylist.forEach(mystate => {
      mymap.set(mystate, true)
    })
    return mymap
  }

  function resetToDefaultLoggers() {
    console.log = console.log2
    console.info = console.info2
    console.warn = console.warn2
    console.error = console.error2
  }

  function version2Int(version) {
    version = (version + "").split('.').join('');
    return parseInt(version)
  }

  function isLoggerOff() {
    let loggerOff = false

    if (_state.appType === "Drupal") { // running on Drupal
      if (!_state.remoteConfig.drupal.logger_enabled) {
        console.log2('Drupal logger off.')
        loggerOff = true
      }
    } else { // running on react
      if (!_state.remoteConfig.react.logger_enabled) {
        console.log2("React logger off.")
        loggerOff = true
      }
    }
    return loggerOff
  }

  function getRunEnvironment(state) {
    let runEnv = null
    if (typeof (window.APP_NAME) !== 'undefined') {
      if(window.APP_NAME.toUpperCase() === 'B2C-CMS'){
        if (typeof(window.APP_ENV) !== 'undefined' ) {
          if (window.APP_ENV === 'local' || window.APP_ENV === 'dev' || window.APP_ENV === 'development') {
            runEnv = 'development'
          } else if (window.APP_ENV === 'test' || window.APP_ENV === 'stage') {
            runEnv = 'test'
          } else if (window.APP_ENV === 'prod' || window.APP_ENV === 'production') {
            runEnv = 'production'
          }
          return runEnv
        } 
      }
    } 
  
    if (typeof (process) !== "undefined") {
      if (typeof (process.env.REACT_APP_ENV) !== 'undefined' || process.env.REACT_APP_ENV !== null) {
        runEnv = process.env.REACT_APP_ENV
        return runEnv
      } 
    }

    return  "development"
  }


  function getRadioLabelText(target) {
    const nextSibling = target.nextElementSibling
    if(nextSibling.tagName !== "LABEL") {
      const vaClickTrack = target.getAttribute('va-click-track')
      if (vaClickTrack !== null) {
        return vaClickTrack
      }
      return target.value
    }
  
    const valabel = nextSibling.getAttribute('va-click-track')
    if(valabel!==null) {
      return valabel
    } else {
      return nextSibling.textContent
    }
  }
  
  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
      }
    );
  }

  return {
    getGlobal,
    getUserId,
    getMemberId,
    getIPAddress,
    getUserContext,
    getLogType,
    generateUserId,
    sendToSentry,
    setUserId,
    getUserId,
    getEmail,
    definePolyFill,
    fetchRemoteConfig,
    setIPAddress,
    getOSVersion,
    getBrowserVersion,
    getAppSuffix,
    detectOSAndBrowser,
    getDrupalName,
    getDrupalEnv,
    delay,
    hashCode,
    isPrivateBrowsing,
    fetchLocationAPI,
    getLocation,
    getRandomChar,
    list2map,
    resetToDefaultLoggers,
    startPerf,
    endPerf,
    version2Int,
    isLoggerOff,
    getRunEnvironment,
    getRadioLabelText,
    toTitleCase
  }

})()