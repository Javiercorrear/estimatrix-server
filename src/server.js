const express = require( 'express' )

const app = express()
const server = require( 'http' ).createServer( app )
const io = require( 'socket.io' )( server, {
  cors: {
    origin: '*',
    credentials: true
  },
  allowEIO3: true
} )

const PORT = process.env.PORT || 3000

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

  socket.on( 'leave_room', ( roomName ) => {
    socket.join( roomName )
  } )

} )

server.listen( PORT, () => console.log( `Server running on port ${ PORT }` ) )
