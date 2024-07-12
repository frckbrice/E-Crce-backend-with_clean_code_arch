module.exports = (controller) => function responseAdapterHandler(req, res) {
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

  console.log("passed the request response handler check")

  controller(httpRequest)
    .then(httpResponse => {
      console.log("response adapter: ", httpResponse)
      if (httpResponse.headers) {
        res.set(httpResponse.headers)
      }

      res
        .type('json')
        .status(httpResponse.statusCode || 400)
        .send(httpResponse.data || "INTERNAL SERVER ERROR")
    })
    .catch(e => {
      res
        .type('json')
        .status(e.statusCode || 500)
        .send({ error: 'An unkown error occurred.', error: e })
    })
}
