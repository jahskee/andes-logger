'use strict';

module.exports = (function(global) {

  // ===== requires =======
  const myutil = require("./myutil")
  const { useState } = require('./mystate')
  // ===== requires =======

  const [ _state ] = useState()

  function extendAxios(axios) {

    axios.interceptors.request.use((config) => {
      config.headers = { ...config.headers, vauser: JSON.stringify(_state.VAUSER) }
      console.log(config.headers)
      return config;
    }, (error) => {
      syswarn(error)
      return Promise.reject(error);
    });

    return axios
  }

  return {
    extendAxios
  }
  
})(this)
