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

const { getTestHandler } = require( './src/handlers/testHandler' )

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
const ROOMS = []

const generateId = ( () => {
  let id = 0
  return () => id++
} )()

io.on( 'connection', socket => {
  console.log( 'Connected socket: ', socket.id )

  socket.on( 'create_a_room', ( message ) => {
    const { roomName, username } = message
    console.log( 'MESSAGE >>>>>>>>> ', message )
    console.log( 'ROOM NAME >>>>>>>>> ', roomName )
    console.log( 'USERNAME >>>>>>>>>> ', username )
    const roomId = generateId()
    ROOMS[ roomId ] = {}
    ROOMS[ roomId ].name = roomName
    ROOMS[ roomId ].owner = username
    // ROOMS[ roomId ].name = roomName
    // ROOMS[ roomId ].owner = username

    console.log( `Room ${ ROOMS[ roomId ].name } with id ${ roomId } created by ${ username }.` )
  } )

  //TODO: fix parameter name after testing
  socket.on( 'join_a_room', ( roomNameObj ) => {
    const { content: roomName } = roomNameObj
    console.log( `Trying to locate room ${ roomName }...` )
    const roomExists = ROOMS.find( room => room.name === roomName )
    if ( roomExists ) {
      console.log( 'Room found. Joining room.' )
      return socket.join( roomName )
    }
    console.error( 'Room not found.' )
    return socket.emit( 'error', JSON.stringify( { message: "The room you are trying to access doesn't exists" } ) )
  } )

  socket.on( 'leave_the_room', ( roomName ) => {
    console.log( `Leaving room ${ roomName }. Bye!` )
    socket.leave( roomName )
  } )

  socket.on( 'join-room', room => {
    console.log( 'ROOM >>>>>>>>>>>>>\n', room )
  } )
  socket.on( 'test', getTestHandler( socket ) )

} )

server.listen( PORT, () => console.log( `Server running on port ${ PORT }` ) )
