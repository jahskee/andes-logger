'use strict'

module.exports = (function() {

  // Application State
  const state = {}

  /*-------- state Hook -------- */
  function useState(initState = {}) {
    function setState(newState = {}) {
      Object.assign(state, { ...newState })
    }
    setState(initState)
    return [state, setState]
  }

  return {
    useState
  }

})()