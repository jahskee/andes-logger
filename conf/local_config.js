module.exports = (function(){

  const remoteConfig = {

    logger_enabled: false,
    cdn: {
      logger_enabled: false,
    },
    version: '1.4.16',
    auto_update_app: false,
    debug: {
        enabled: false,
        show_remote_config: false,
        show_app_state: false,
    },
    filter_location: { 
        enabled: false,
        filter_by: 'state',  // values '[city|'state']
        states: ['NY','VA'],
        cities: [{state: 'NY', city: 'New York'}, {state: 'VA', city: 'Arlington'}],
    },
    api: {
        fe_msg:"https://us-central1-engineeringops-sre.cloudfunctions.net/fe-msg-dev",
    },
  }

  return remoteConfig

})()