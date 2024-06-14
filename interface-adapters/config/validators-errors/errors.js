const { makeHttpError } = require("./http-error")

class UniqueConstraintError extends Error {
  constructor(value) {
    super(`${value} must be unique.`)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UniqueConstraintError)
    }
  }
}

class InvalidPropertyError extends Error {
  constructor(msg) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidPropertyError)
    }
  }
}

class RequiredParameterError extends Error {
  constructor(param) {
    super(`${param} can not be null or undefined.`)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RequiredParameterError)
    }
  }
}

//NOT FOUND
const NotFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

//Error Handler

const ErrorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;
  makeHttpError({ statusCode, errorMessage: err.message, stack: err.stack })
  next(err)
}


module.exports = {
  UniqueConstraintError, InvalidPropertyError, RequiredParameterError, NotFound, ErrorHandlerMiddleware}