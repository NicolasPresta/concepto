// Imports
import http from 'http'
import express from 'express'
import bodyParser from "body-parser"
//import methodOverride from "method-override"
import socketio from 'socket.io'
//import jwt from "jsonwebtoken"
import socketJWT from "socketio-jwt"

import colaManager from 'src/lib/cola'
import log from 'src/lib/log'
import appConfig from 'src/config/config'
import router from 'src/api/router'

// Definicion de constantes
const app = express();
const server = http.createServer(app);
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3001;
const io = socketio(server);


// Middlewares
//app.use(bodyParser.urlencoded({ extended: false })); // Analisar si se usa o si se puede sacar
app.use(bodyParser.json());
//app.use(methodOverride()); // Analisar si se usa o si se puede sacar
app.use(router);
// Permite servir los archivos estaticos de la carpeta /Cliente (necesario para levantar los clientes y cajas dummys)
app.use(express.static('Cliente'))


// Conexiones por socket

//Autorización con token
//Luego de validar el token, su payload queda guardado en socket.decoded_token
//Ahí tenemos la info del cliente y su id de dispositivo, por lo que usamos ese mismo payload para identificarlo
io.use(socketJWT.authorize({
	secret: appConfig.app_secret,
	handshake: true
}));

io.sockets.on('connect', (socket) => {

	log.info(`Socket: Nueva conexión ${socket.id} (en puerto ${port}),  Usuario: ${socket.decoded_token.user},  uuid:  ${socket.decoded_token.uuid}`);

	// Primero: Chequeo que no sea un cliente que volvió después de haber estado offline
	if (socket.decoded_token.user == 'cliente'){
		colaManager.verificarReconexion(socket.decoded_token.uuid);
	}

	// Luego: Emito este evento, pues si el cliente es uno que volvio de estar offline, la cola sufrió modificaciones
	io.emit('actualizarFila', colaManager);

	// TODO: Analisar CUANDO y PQ se emite este evento "disconnect"
	socket.on('disconnect', () =>{
		log.info(`Socket: Se desconectó ${socket.id} (en puerto ${port})`);

		if (socket.decoded_token.user == 'cliente'){
			// Si el que se desconecta es un cliente, lo marcamos como desconectado
			colaManager.clienteDesconectado(socket.decoded_token.uuid);
		} else {
			//ver que se hace con las cajas en caso de desconexión
			//NMR: 	Se me ocurre que se puede cerrar la caja y listo. De esta forma nadie más va a ser llamado a esa caja.
			// 		Si luego la caja vuelve a conectarse se va a marcar como abierta nuevamente y todos felices.
			colaManager.cerrarCaja(socket.decoded_token.uuid)
			io.emit('actualizarFila', colaManager)
		}
	});


	// El cliente usa este metodo para conocer la fila actual, se usa en caso de que se haya desconectado.
	socket.on('pedirActualizacion', () =>{
		socket.emit('actualizarFila', colaManager);
	});


	socket.on('hacerFila', () => {
		log.debug('hacer fila');

		// Agregar en la fila
		colaManager.hacerFila(socket.decoded_token.uuid);

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
		log.debug('alguien salió');
		
		// verificar si está haciendo la fila, sacar de la fila, rearmar fila
		colaManager.salirFila(socket.decoded_token.uuid);

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager);

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});


	socket.on('atendiCliente', (uuidCliente) => {

		// Sacar al cliente de la fila de la caja
		colaManager.atendiCliente(socket.decoded_token.uuid, uuidCliente)

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager)

		// notificar al cliente atendido que ya fue atendido.
		var socketDestino = getSocketFromUuid(uuidCliente)
		if(socketDestino)
			socket.to(socketDestino.id).emit('clienteAtendido');

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});


	socket.on('llamarOtroCliente', () => {

		// Sacar a un cliente de la fila generar y pasarlo a la fila de la caja
		colaManager.llamarOtroCliente(socket.decoded_token.uuid)

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager)

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});


	socket.on('abrirCaja', () => {

		log.info("Abrir CAJA -" + socket.decoded_token.uuid)
		
		// Agregar la caja al sistema, Rearmar las colas
		colaManager.abrirCaja(socket.decoded_token.uuid)

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager)

		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});


	socket.on('cerrarCaja', () => {

		// Cerrar la caja en al sistema, Rearmar las colas
		colaManager.cerrarCaja(socket.decoded_token.uuid)

		// notificar a todos los integrantes de la fila y a las cajas
		io.emit('actualizarFila', colaManager)

		
		// grabar en base de datos el evento

		// Grabar en REDIS la nueva cola
	});
});

//Dado un uuid retorna el socket
function getSocketFromUuid(uuid){
	var sockets = io.sockets.connected
	var encontrado = null

	for(var index in sockets) {
 	 	if (sockets[index].decoded_token.uuid == uuid)
 	 		encontrado = sockets[index]
	}

	if(!encontrado)
		log.error("se está buscando a un socket, por un uuid que no existe")

	return encontrado
}


// Nos ponemos a escuchar... hello! 
server.listen(port, () => log.info(`Servidor Iniciado en puerto ${port}`));
