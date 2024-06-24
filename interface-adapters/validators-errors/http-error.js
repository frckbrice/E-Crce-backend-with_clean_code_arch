module.exports = {
  makeHttpError: ({ statusCode, errorMessage, stack })  => {
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode,
      data: JSON.stringify({
        success: false,
        error: errorMessage,
        stack
      })
    }
  }
  
}