"use strict";

module.exports = (function () {
  // ===== requires =======
  const createLogFuncs = require("./libs/myfuncs");
  const myutil = require("./libs/myutil");
  const myfetch = require("./libs/myfetch");
  const mymsg = require("./libs/mymsg");
  const myclicktrack = require("./libs/myclictrack");
  // const myaxioslib = require("./libs/myaxios")
  const mydrupal = require("./libs/mydrupal");
  const { useState } = require("./libs/mystate");
  // ===== requires =======

  const [_state] = useState();

  _state.VERSION = "1.0.0";
  _state.RUN_ENV = myutil.getRunEnvironment(_state);

  var myglobal = myutil.getGlobal();
  let isLoaded = false;

  /* ==== Start of Init() ===== */
  async function init(Sentry = null) {
    backUpConsole();

    const startTime = new Date().getTime();
    _state.IS_PRIVATE_BROWSING = myutil.isPrivateBrowsing();
    _state.remoteConfig = await myutil.fetchRemoteConfig();

    if (_state.RUN_ENV !== "production") {
      console.log2("App: " + _state.appName);
      console.log2("Type: " + _state.appType);
      console.log2("---------------------------------------");
      console.log2(`     @andesoft/logger@${_state.VERSION}  `);
      console.log2("---------------------------------------");
    }

    if (myutil.isLoggerOff()) {
      return;
    }

    if (_state.remoteConfig.debug.enabled) {
      console.log2("in debug mode.");
    }

    extendConsole(Sentry);
    myutil.definePolyFill();
    myutil.setUserId();
    myutil.detectOSAndBrowser();

    if (_state.remoteConfig.auto_update_app) {
      const newVersion = myutil.version2Int(_state.remoteConfig.version);
      const myVersion = myutil.version2Int(_state.VERSION);
      if (myVersion < newVersion) {
        console.log("reloading to latest: " + _state.remoteConfig.version);
        window.location.href = window.location.href;
      }
    }

    // fetch IP address with two tries
    /*try {
      _state.LOCATION = await myutil.fetchLocationAPI();
      _state.IP_ADDRESS = _state.LOCATION.query;
    } catch (error) {*/
     // syswarn("init(), please upgrade extreme-ip-lookup.com", error);
      try {
        _state.IP_ADDRESS = await myutil.setIPAddress(); // first try
        _state.LOCATION = {};
      } catch (error) {
        try {
          _state.IP_ADDRESS = await myutil.setIPAddress(); // second try
          _state.LOCATION = {};
        } catch(error) {
          syswarn("init() unable to fetch ip-address, resuming");
        }
      }
    //}

    if (_state.remoteConfig.debug.show_remote_config) {
      syslog("show remoteConfig", _state.remoteConfig);
    }

    if (_state.LOCATION === null) {
      _state.remoteConfig.filter_location.enabled = false;
      _state.LOCATION = {};
      syswarn("init() states filter disabled.");
    }

    if (_state.IS_PRIVATE_BROWSING) {
      syslog("browsing in private mode, in-memory storage");
    }

    if (_state.remoteConfig.filter_location.enabled) {
      const filter_state_list = myutil.list2map(
        _remoteConfig.filter_location.states
      );

      if (filter_state_list.has(_state.LOCATION.state)) {
        syslog("filter by state = " + _state.LOCATION.state);
      } else {
        syslog("disabled."); // disable logger
        myutil.resetToDefaultLoggers();
        isLoaded = false;
        return;
      }
    }

    try {
      await setupLogger();
      syslog("loadTime =", new Date().getTime() - startTime, "ms");
      if (_state.remoteConfig.debug.show_app_state) {
        syslog("show state", _state);
      }
    } catch (error) {
      // silently fail, recover and restore to default
      syslog("init(), disabled", { msg: error.message });
      myutil.resetToDefaultLoggers();
      isLoaded = false;
      console.log2("logger completely initialized.");
    }
  }
  /* ==== End of Init() ===== */

  async function setupLogger() {
    _state.VAUSER = getUserInfo();
    _state.VAUSER.env = _state.RUN_ENV;

    // window.extendAxios = myaxioslib.extendAxios
    myglobal.fetch = myfetch.extendFetch;
    isLoaded = true;
  }

  function getUserInfo() {
    let userInfo = {};
    try {
      userInfo = mymsg.getUserInfo(_state.VERSION);
      userInfo.appName = _state.appName;
    } catch (error) {
      syswarn("getUserInfo()", error);
    }
    return userInfo;
  }

  function setMemberId(memberId) {
    try {
      if (!isLoaded) {
        return;
      }

      _state.MEMBER_ID = memberId;
      !_state.IS_PRIVATE_BROWSING &&
        localStorage.setItem("vaMemberId", memberId);
    } catch (error) {
      syswarn("setMemberId()", error);
    }
  }

  function setEmail(email) {
    try {
      if (!isLoaded) {
        return;
      }
      if (email !== "" && email !== null) {
        email = btoa(email); // + myutil.getRandomChar()
      }
      //state.EMAIL = email
      _state.EMAIL = email;

      !_state.IS_PRIVATE_BROWSING && localStorage.setItem("vaEmail", email);
      console.log("Signed in with email " + email);
    } catch (error) {
      syswarn("setEmail()", error);
    }
  }

  function backUpConsole() {
    console.warn2 = console.warn;
    console.error2 = console.error;
    if (_state.RUN_ENV === "development") {
      console.log2 = console.log;
      console.info2 = console.info;
    } else {
      console.log2 = () => {};
      console.info2 = () => {};
    }
  }

  function extendConsole(Sentry) {
    const logFuncs = createLogFuncs(Sentry);
    myglobal.syslog = logFuncs.funcSysLog;
    myglobal.syswarn = logFuncs.funcSysWarn;
    myglobal.syserror = logFuncs.funcSysWarn;

    console.log = logFuncs.funcInfo;
    console.info = logFuncs.funcInfo;
    console.warn = logFuncs.funcWarn;
    console.error = logFuncs.funcError;
  }

  // React
  async function withRemoteLogger(reactApp, appName = "", sentry = null) {
    try {
      _state.appName = appName + myutil.getAppSuffix(_state.RUN_ENV);
      _state.appType = "React";
      await init(sentry);
      if (_state.remoteConfig.react.track_button_click) {
        myclicktrack.trackButtonClicks();
        console.log2("Track button click - on");
      } else {
        console.log2("Track button click - off");
      }
    } catch (error) {
      console.log("valogger init failed!", error);
    }
    reactApp();
  }

  // Drupal
  if (typeof window.APP_NAME !== "undefined") {
    if (window.APP_NAME !== null) {
      window.APP_NAME = window.APP_NAME.toUpperCase();
      _state.appName = window.APP_NAME + myutil.getAppSuffix(_state.RUN_ENV);
      _state.appType = "Drupal";
      mydrupal.loadCDNVersion(init);
    }
  }

  return { withRemoteLogger, setMemberId, setEmail };
})();
