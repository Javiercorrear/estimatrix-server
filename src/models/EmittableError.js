module.exports = class EmittableError {
  constructor( messageOrError ) {
    const isString = typeof messageOrError === 'string'
    const isErrorObject = typeof messageOrError === 'object' && !Array.isArray( messageOrError ) || messageOrError.message

    if ( isString ) {
      this.message = messageOrError
    } else if ( isErrorObject ) {
      this.message = messageOrError.message
    } else {
      console.error( 'The error message could not be built correctly since the error parameter type is unexpected' )
      this.message = 'No error message. EmittableError constructor received unexpected type.'
    }
  }
}
