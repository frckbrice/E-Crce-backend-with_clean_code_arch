module.exports = {
  makeHttpError: ({ statusCode, errorMessage, stack }) => {
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode,
      data: {
        success: false,
        error: errorMessage,
        stack
      }
    }
  }

}