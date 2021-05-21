const myutils = require("./myutil")

// Polyfill if running on Node.js
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./tmp');
}

describe('Test MyUtil', () => {
  it('test getMsg(...);', () => {

    // test when string
    let result = myutils.getMsg("test") 
    expect(result).toEqual({message:"test", type:"string"})
   
    // test if input is number
    result = myutils.getMsg(1) 
    expect(result).toEqual({message:"1", type:"string"})

    // test if input is null
    result = myutils.getMsg(null) 
    expect(result).toEqual({message:"null", type:"string"})
 
    // test if input is boolean
    result = myutils.getMsg(true) 
    expect(result).toEqual({message:"true", type:"string"})

    // test if object param
    const objParam = {hello: "test1", world:"test2"}
    result = myutils.getMsg(objParam)
    expect(result).toEqual({message: objParam, type:"object"})

    // test if error param
    const errorParam = new Error("hello world")
    result = myutils.getMsg(errorParam)
    expect(result).toEqual({message: errorParam.message, stack: errorParam.stack, type:"error_obj"})
  
  });
  it('My Test Case', () => {
    expect(true).toEqual(true);
  });
  it('My Test Case2', () => {
    expect(true).toEqual(true);
  });
});