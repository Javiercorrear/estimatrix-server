const getTestHandler = ( socket ) => data => {
  console.log( data )
  try {
    const content = JSON.stringify( data.content )
    socket.emit( 'receivedMessage', { ...data, content } )
  } catch ( error ) {
    console.error( error.stack )
    socket.emit( 'receivedMessage', { name: data.name, content: error.message } )
  }
}

module.exports = {
  getTestHandler
}
