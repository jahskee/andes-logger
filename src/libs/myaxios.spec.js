describe('', ()=>{
  const myaxioslib = require('./myaxios')
  var axios = myaxioslib.extendAxios(require('axios'))

  global.VAUSER = { name: 'hello', appName: 'Test-APP' }

  describe('1.0 Actual Axios API Call Test', () => {
     
      it('1.1 myaxios(...) call test-1', async () => {
        try {
          const resp = await axios({
            url: 'https://us-central1-engineeringops-sre.cloudfunctions.net/test-1',
            method: 'post',
            data: { data: { msg: "From axios Interceptor" } }
          })
          expect(resp.status).toEqual(200);
        } catch (error) {
          console.error(error.message)
        }
      })

      it('1.1 myaxios.post(...) call test-1', async () => {
        try {
          const resp = await axios.post('https://us-central1-engineeringops-sre.cloudfunctions.net/test-1', 
           { data: {msg: "From axios Post Interceptor"}})
          expect(resp.status).toEqual(200);
        } catch (error) {
          console.error(error.message)
        }
      })

  })

})