module.exports = {

  makeResponseCallback: (createUserController) => {

    return function userRequestResponseHandler({ httpRequest, res }) {

      createUserController(httpRequest)
        .then(httpResponse => {
          if (httpResponse.headers) {
            res.set(httpResponse.headers)
          }

          res
            .type('json')
            .status(httpResponse.statusCode)
            .send(httpResponse.data)
        })
        .catch(e => res
          .status(500)
          .send({ error: 'An unkown error occurred.', error: e }))
    }
  }

}
