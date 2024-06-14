const {RequiredParameterError} = require('./errors')

export default function requiredParam (param) {
  throw new RequiredParameterError(param)
}
