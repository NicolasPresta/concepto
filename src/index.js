// Imports
import http from 'http'
import express from 'express'
//import semaforo from 'semaphore'
//import Redis from 'ioredis'
import socketio from 'socket.io'
import jwt from "jsonwebtoken"
import socketJWT from "socketio-jwt"

import colaManager from './lib/cola.js'
import secureManager from './lib/secure'
import log from './lib/console-log.js'


// Definicion de constantes
const app = express();
const server = http.createServer(app);
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3001;
const router = express.Router();
//const sem = semaforo(1)
//const redis = new Redis()
const io = socketio(server);


const APP_SECRET = "1_4m_@_53Cr3T!";


// Puntos de entrada REST
router.post('/handshake', (req, res) => {
	//TODO: verificar de algún modo la autenticidad del uuid
	let uuid = req.body.uuid;
	let response = {
		success: true,
		token: secureManager.handShake(uuid)
	};
	res.send(200)(response);
});


app.use(router);
app.use('/secure', (req, res, next) => {
	//Definir en donde va a llegar el token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var checkResponse = secureManager.getToken(token);
	if (checkResponse.success){
		req.decoded = checkResponse.data;
		next();
	} else {
		res.send(checkResponse.code)(checkResponse);
	}
});

app.use(express.static('Cliente'))

// Conexiones por socket
io.set('authorization', socketJWT.authorize({
	secret: APP_SECRET,
	handshake: true
}));

io.sockets.on('connection', (socket) => {
  log.info(`Socket: Nueva conexión ${socket.id} (en puerto ${port})`);

  // Uso el id del socket como identificador único, claramente eso no puede usarse en la realidad, ya que
  // un cliente podria conectarse, desconectarse y volverse a conectar con otro socket.id, pero seguiria siendo el mismo cliente.
  socket.emit('tomaID', socket.id);

  socket.on('disconnect', () =>{
    log.info(`Socket: Se desconectó ${socket.id} (en puerto ${port})`);

    // Esto abria que controlarlo, pero para prototipar lo dejo asi:
    colaManager.salirFila(socket.id);
    colaManager.cerrarCaja(socket.id)
  });

  socket.on('saludoGeneral', () => {
    io.sockets.emit('saludo', socket.id)
  });

  socket.on('hacerFila', () => {

    socket.join(ROOM_EN_FILA)
    colaManager.hacerFila(socket.id)
    socket.broadcast.emit('nuevaCola', colaManager)
    socket.emit('nuevaCola', colaManager)
    //cola.push(socket.id)
    //socket.broadcast.to(ROOM_EN_FILA).emit('nuevaCola', cola)

    // verificar que no esté haciendo ya la fila

    // agregar al final de la fila

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  });

  socket.on('retrasarme', () => {

    // verificar si está haciendo la fila

    // retroceder 1 lugar la primera vez, 2 lugares la segunda vez, 3 lugares la tercera vez, y así

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  });

  socket.on('salirFila', () => {

    colaManager.salirFila(socket.id)
    socket.broadcast.emit('nuevaCola', colaManager)
    socket.emit('nuevaCola', colaManager)

    // verificar si está haciendo la fila

    // sacar de la fila

    // rearmar fila

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  });

  socket.on('atendiCliente', (nroCliente) => {

    colaManager.atendiCliente(socket.id, nroCliente)
    socket.broadcast.emit('nuevaCola', colaManager)
    socket.emit('nuevaCola', colaManager)

    // Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  });

  socket.on('llamarOtroCliente', () => {

    colaManager.llamarOtroCliente(socket.id)
    socket.broadcast.emit('nuevaCola', colaManager)
    socket.emit('nuevaCola', colaManager)

    //cola.shift()
    //socket.leave(ROOM_EN_FILA)
    //socket.broadcast.to(ROOM_EN_FILA).emit('nuevaCola', cola)

    // Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

    // notificar a todos los integrantes de la fila y a las cajas

    // grabar en base de datos el evento

    // Grabar en REDIS la nueva cola

  });

  socket.on('abrirCaja', () => {
   
      colaManager.abrirCaja(socket.id)
      socket.broadcast.emit('nuevaCola', colaManager)
      socket.emit('nuevaCola', colaManager)

      // Generar un ID único para la caja

      // Devolverle el ID

      // Agregar la caja al sistema

      // Rearmar las colas

      // notificar a todos los integrantes de la fila y a las cajas

      // grabar en base de datos el evento

      // Grabar en REDIS la nueva cola
  });

  socket.on('cerrarCaja', () => {
   
      colaManager.cerrarCaja(socket.id)
      socket.broadcast.emit('nuevaCola', colaManager)
      socket.emit('nuevaCola', colaManager)

      // Quitar la caja al sistema

      // Rearmar las colas

      // notificar a todos los integrantes de la fila y a las cajas

      // grabar en base de datos el evento

      // Grabar en REDIS la nueva cola
  })

});


// Nos ponemos a escuchar... hello! 
server.listen(port, () => log.info(`Servidor Iniciado en puerto ${port}`));
