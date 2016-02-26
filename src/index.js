// Imports
import http from 'http'
import express from 'express'
import bodyParser from "body-parser"
import methodOverride from "method-override"
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
	console.log(req.body);

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

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(router);


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

	//Luego chequeo que no sea un cliente que volvió después de haber estado offline
	if (socket.decoded_token.user == 'cliente'){
		colaManager.getClientePrioridad(socket.decoded_token.uuid);
	}

	io.emit('actualizarFila', colaManager);

	// TODO: Analisar cuando se emite este evento.
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

	// El cliente usa este metodo para conocer la fila actual, se usa en caso de que se haya desconectado.
	socket.on('pedirActualizacion', () =>{
		socket.emit('actualizarFila', colaManager);
	})

	socket.on('hacerFila', () => {
		console.log('hacer fila');

		// Agregar en la fila
		colaManager.hacerFila(socket.decoded_token);

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager);

		// Grabar en REDIS la nueva cola


		// grabar en base de datos el evento



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
		io.emit('actualizarFila', colaManager);
		//socket.emit('estadoSistema', colaManager);

		// verificar si está haciendo la fila

		// sacar de la fila

		// rearmar fila

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola

		//hola

	});

	socket.on('atendiCliente', (nroCliente) => {

		colaManager.atendiCliente(socket.decoded_token.uuid, nroCliente)
		io.emit('actualizarFila', colaManager)
		socket.to(nroCliente).emit('clienteAtendido');
		// Sacar a un cliente de la fila generar y pasarlo a la fila de la caja

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola

	});

	socket.on('llamarOtroCliente', () => {

		colaManager.llamarOtroCliente(socket.decoded_token.uuid)
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

		log.info("Abrir CAJA -" + socket.decoded_token.uuid)
		colaManager.abrirCaja(socket.decoded_token.uuid)
		io.emit('actualizarFila', colaManager)

		// Generar un ID único para la caja

		// Devolverle el ID

		// Agregar la caja al sistema

		// Rearmar las colas

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});

	socket.on('cerrarCaja', () => {

		colaManager.cerrarCaja(socket.decoded_token.uuid)
		io.emit('actualizarFila', colaManager)

		// Quitar la caja al sistema

		// Rearmar las colas

		// notificar a todos los integrantes de la fila y a las cajas

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	})

});


// Nos ponemos a escuchar... hello! 
server.listen(port, () => log.info(`Servidor Iniciado en puerto ${port}`));
