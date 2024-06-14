const {makeResponseCallback} = require("./response-adapter");
const {createUserController} = require("../controllers/users/index"); 
const {requestAdapter} = require("./request-adapter");

const userRequestResponseHandler = makeResponseCallback(createUserController);
module.exports = {userRequestResponseHandler, requestAdapter}