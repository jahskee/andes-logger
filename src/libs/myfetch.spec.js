
const myfetchlib = require('./myfetch')
const myfetch = require('./myfetch')
describe('Test Fetch interceptor', () => {
 
  global.fetch = myfetchlib.extendFetch

  it ('test attach vauser to body', ()=>{
    const vauser = { test: "hello" }

    const inputParam = { data: {mydata: "hello1"}}

    const expectedParam =  { ...inputParam, vauser}
    console.log(expectedParam)
    const result = myfetch.updatePostBody_withUserContext(inputParam, vauser)
    console.log(result)
    expect(result).toEqual(expectedParam)

  })


  it.only('Test with body and no header', async ()=>{
    global.VAUSER = { name: 'hello', appName: 'Test-APP6a' }
    const response = await fetch('https://us-central1-engineeringops-sre.cloudfunctions.net/test-1', {
      method: 'POST',
      body: JSON.stringify({ data: { msg: "From axios Interceptor" }})
    })
    expect(response.status).toBe(200)
  })

  it('Test with existing header', async ()=>{
    global.VAUSER = { name: 'hello', appName: 'Test-APP6b' }
    const response = await fetch('https://us-central1-engineeringops-sre.cloudfunctions.net/test-1', {
      method: 'POST',
      body: { data: { msg: "From axios Interceptor" }},
      headers: {'test': 'test'}
    })

    expect(response.status).toBe(200)
  })
})