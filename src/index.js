// Imports
import http from 'http'
import express from 'express'
//import semaforo from 'semaphore'
//import Redis from 'ioredis'
import cola from './lib/cola.js'
import socketio from 'socket.io'
import Log from 'log'


// Definicion de constantes
const app = express()
const server = http.createServer(app)
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3001
const router = express.Router()
//const sem = semaforo(1)
//const redis = new Redis()
const io = socketio(server)
const log = new Log('info');


const ROOM_EN_FILA = 1


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
  log.info(`Socket: Nueva conexión ${socket.id} en puerto ${port}`)

  socket.on('saludoGeneral', () => {
      io.sockets.emit('saludo', socket.id)
  })

  socket.on('handshake', (gps) => {

    // generar para el cliente un ID único

    // retornarle el ID

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('hacerFila', (gps) => {

    //socket.join(ROOM_EN_FILA)
    //cola.push(socket.id)
    //socket.broadcast.to(ROOM_EN_FILA).emit('nuevaCola', cola)

    // verificar que no esté haciendo ya la fila

    // agregar al final de la fila

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('retrasarme', () => {

    // verificar si está haciendo la fila

    // retroceder 1 lugar la primera vez, 2 lugares la segunda vez, 3 lugares la tercera vez, y así

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('abandonarFila', () => {

    // verificar si está haciendo la fila

    // sacar de la fila

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('atendiCliente', (caja, nroCliente) => {
    //cola.shift()
    //socket.leave(ROOM_EN_FILA)
    //socket.broadcast.to(ROOM_EN_FILA).emit('nuevaCola', cola)

    // Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('llamarOtroCliente', (caja) => {
    //cola.shift()
    //socket.leave(ROOM_EN_FILA)
    //socket.broadcast.to(ROOM_EN_FILA).emit('nuevaCola', cola)

    // Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  })

  socket.on('registrarCaja', () => {
   
      // Generar un ID único para la caja

      // Devolverle el ID

      // Agregar la caja al sistema

      // Rearmar las colas

      // notificar a todos los integrantes de la fila y a las cajas

      // grabar en base de datos el evento

      // Grabar en REDIS la nueva cola
  })

  socket.on('bajaDeCaja', (nroCaja) => {
   
      // Quitar la caja al sistema

      // Rearmar las colas

      // notificar a todos los integrantes de la fila y a las cajas

      // grabar en base de datos el evento

      // Grabar en REDIS la nueva cola
  })

})


// Nos ponemos a escuchar... hello! 
server.listen(port, () => log.info(`Servidor Iniciado en puerto ${port}`))
