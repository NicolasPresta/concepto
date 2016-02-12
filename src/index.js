// Imports
import http from 'http'
import express from 'express'
import bodyParser from "body-parser"
import methodOverride from "method-override"
//import semaforo from 'semaphore'
//import Redis from 'ioredis'
import socketio from 'socket.io'
import jwt from "jsonwebtoken"
import socketJWT from "socketio-jwt"

import colaManager from './lib/cola.js'
import secureManager from './lib/secure'
import log from './lib/console-log.js'

import appConfig from './lib/config'

// Definicion de constantes
const app = express();
const server = http.createServer(app);
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3001;
const router = express.Router();
//const sem = semaforo(1)
//const redis = new Redis()
const io = socketio(server);


// Puntos de entrada REST
//Handshake para dispositivos
router.post('/handshake', (req, res) => {
	//TODO: verificar de algún modo la autenticidad del uuid
	let userAgent = req.headers['user-agent'];
	let uuid = req.body.uuid;

	let response = secureManager.handShake(userAgent, uuid);
	res.status(response.code).json(response);
});

router.post('/authCashbox', (req, res) => {
	let idCaja = req.body.idCaja;
	let pass = req.body.password;

	let response = secureManager.authCashbox(idCaja, pass);
	res.status(response.code).json(response);
});

router.post('/testHandshake', (req, res) => {
	console.log(req.body);
	let miId = req.body.id;
	let response = secureManager.testHandshake(miId);
	res.status(response.code).json(response);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(router);
/*
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
 */

// Conexiones por socket

//Autorización con token
//Luego de validar el token, su payload queda guardado en socket.decoded_token
//Ahí tenemos la info del cliente y su id de dispositivo, por lo que usamos ese mismo payload para identificarlo
io.use(socketJWT.authorize({
	secret: appConfig.app_secret,
	handshake: true
}));


app.use(express.static('Cliente'))

io.sockets.on('connect', (socket) => {
	log.info(`Socket: Nueva conexión ${socket.id} (en puerto ${port})`);
	console.log('Nueva conexión usuario ' + socket.decoded_token.user + ' - uuid: ' + socket.decoded_token.uuid);

	//Primero envío info del estado del sistema
	socket.emit('estadoSistema', colaManager.getObjetoColas());
	//Luego chequeo que no sea un cliente que volvió después de haber estado offline
	if (socket.decoded_token.user == 'cliente'){
		if (colaManager.getClientePrioridad(socket.decoded_token.uuid)){
			io.emit('actualizarFila', colaManager.getColaGeneral());
		}
	}

	socket.on('disconnect', () =>{
		log.info(`Socket: Se desconectó ${socket.id} (en puerto ${port})`);

		// Esto abria que controlarlo, pero para prototipar lo dejo asi:
		if (socket.decoded_token.user == 'cliente'){
			colaManager.clienteDesconectado(socket.decoded_token);
		} else {
			//ver que se hace con las cajas
		}
		//colaManager.salirFila(socket.decoded_token);
		//colaManager.cerrarCaja(socket.decoded_token);
	});

	socket.on('pedirActualizacion', () =>{
		socket.emit('actualizarFila', colaManager.getColaGeneral());
	})

	socket.on('hacerFila', () => {
		console.log('hacer fila');
		colaManager.hacerFila(socket.decoded_token);
		io.emit('actualizarFila', colaManager.getColaGeneral());
		//socket.emit('haciendoFila', colaManager)
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

		console.log('alguien salió');
		colaManager.salirFila(socket.decoded_token);
		socket.broadcast.emit('actualizarFila', colaManager.getColaGeneral());
		socket.emit('estadoSistema', colaManager.getObjetoColas());

		// verificar si está haciendo la fila

		// sacar de la fila

		// rearmar fila

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola

	});

	socket.on('atendiCliente', (nroCliente) => {

		colaManager.atendiCliente(socket.id, nroCliente)
		io.emit('actualizarFila', colaManager)
		socket.to(nroCliente).emit('clienteAtendido');
		// Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola

	});

	socket.on('llamarOtroCliente', () => {

		colaManager.llamarOtroCliente(socket.id)
		io.emit('actualizarFila', colaManager)

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
