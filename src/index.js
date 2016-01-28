// Imports
import http from 'http'
import express from 'express'
import semaforo from 'semaphore'
import Redis from 'ioredis'
import cola from './lib/cola.js'
import socketio from 'socket.io'

// Definicion de constantes
const app = express()
const server = http.createServer(app)
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3001
const router = express.Router()
//const sem = semaforo(1)
//const redis = new Redis()
const io = socketio(server)

const EN_FILA = 1


// Puntos de entrada REST
router.get('/push/:param', (req, res) => {
	let dato = req.params.param
   	cola.push(dato)
	res.json({cola: cola})
})

router.get('/shift', (req, res) => {	
  	let elemento = cola.shift()
	res.json({cola: cola, elemento: elemento})
})

app.use(router)


// Conexiones por socket
io.on('connection', (socket) => {
  console.log(`Connected ${socket.id} on instance ${port}`)

  socket.on('saludoGeneral', () => {
      io.sockets.emit('saludo', socket.id)
  })

  socket.on('hacerFila', () => {
    socket.join(EN_FILA)
    cola.push(socket.id)
    socket.broadcast.to(EN_FILA).emit('nuevaCola', cola)
  })

  socket.on('atenderCliente', () => {
  	cola.shift()
  	socket.leave(EN_FILA)
    socket.broadcast.to(EN_FILA).emit('nuevaCola', cola)
  })
})



// Inicializamos el servidor
server.listen(port, () => console.log(`Server listening on port ${port}`))
