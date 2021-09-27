const express = require( 'express' )
const path = require( 'path' )
const ejs = require( 'ejs' )

const app = express()
const server = require( 'http' ).createServer( app )
const io = require( 'socket.io' )( server, {
  cors: {
    origin: '*',
    credentials: true
  },
  allowEIO3: true
} )

process.env.EVENT_NAME = 'default'
const PORT = process.env.PORT || 3000

app.use( express.static( path.join( __dirname, 'public' ) ) )
app.set( 'views', path.join( __dirname, 'public' ) )
app.engine( 'html', ejs.renderFile )
app.set( 'view engine', 'html' )

app.use( '/', ( req, res ) => {
  res.render( 'index.html' )
} )

// TO DO: make sure the room is removed after all participants have left the room
const ROOMS = {}

const generateId = ( () => {
  let id = 0
  return () => id++
} )()

io.on( 'connection', socket => {
  console.log( 'Connected socket: ', socket.id )

  socket.on( 'create_room', ( roomName, username ) => {
    const roomId = generateId()
    ROOMS[ roomId ] = {}
    ROOMS[ roomId ].name = roomName
    ROOMS[ roomId ].owner = username
  } )

  socket.on( 'join_room', ( roomName ) => {
    const roomExists = ROOMS.find( room => room.name === roomName )
    if ( roomExists ) {
      return socket.join( roomName )
    }
    return socket.emit( 'error', JSON.stringify( { message: 'The room you are trying to access doesn\'t exists' } ) )
  } )

  socket.on( 'test', data => {
    console.log( data )
    try {
      const content = JSON.stringify( data.content )
      socket.emit( 'receivedMessage', { ...data, content } )
    } catch ( error ) {
      console.error( error.stack )
      socket.emit( 'receivedMessage', { name: data.name, content: error.message } )
    }
  } )

  socket.on( 'leave_room', ( roomName ) => {
    socket.join( roomName )
  } )

} )

server.listen( PORT, () => console.log( `Server running on port ${ PORT }` ) )
