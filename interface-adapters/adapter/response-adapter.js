module.exports = {

  makeResponseCallback: (controller) => {

    return function responseAdapterHandler ( req, res ) {
      const httpRequest = {
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        method: req.method,
        path: req.path,
        headers: {
            'Content-Type': req.get('Content-Type'),
            Referer: req.get('referer'),
            'User-Agent': req.get('User-Agent')
        }
    };

      controller(httpRequest)
        .then(httpResponse => {
          console.log("response adapter: ", httpResponse) 
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
