// TODO: retrasarme, calcular tiempos de espera, etc

import log from 'src/lib/log'
import appConfig from 'src/config/config';

const MAXIMO_POR_CAJA = 2; // La cantidad de gente al mismo tiempo que llaman las cajas.
const RETRASO_MINIMO = 2; // La cantidad de personas que se dejan pasar en la fila cuando alguien se retrasa

// Clase CAJA
function Caja(nro){

	this.numero = nro;
	this.cola = [];
	this.atendiendo = true;

	this.puedeAtenderNuevoCliente = function(){
		return this.cola.length < MAXIMO_POR_CAJA & this.atendiendo;
	};

	this.getCliente = function(idCliente){
		return this.cola.find((cliente) => {
			return cliente.id == idCliente;
		});
	};

	this.sacarCliente = function(cliente){
		var index = this.cola.indexOf(cliente);

		if (index > -1) {
    		 this.cola.splice(index, 1)
		}
		else
			log.error("esto no debería pasar en: sacarCliente")
	}
}


// Clase CLIENTE
function Cliente(idCliente){
	this.id = idCliente;
	this.retrasoPersonas = RETRASO_MINIMO;
	this.conectado = true;
}


// Manager de COLAS
var colaManager = {

	tiempoPromedioAtencion: 5, // TODO: calculo de este abributo

	cajas: [],
	colaGeneral: [],

	//Para clientes que se desconecten (TODO: Pensar que esta cola podria quedar con conexiones muy viejas, depurar?)
	colaOffline: [],


	getCaja: function(nroCaja){
		return this.cajas.find((caja) => {
			return caja.numero == nroCaja;
		});
	},

	getCliente: function(idCliente){
		return this.colaGeneral.find((cliente) => {
			return cliente.id == idCliente;
		});
	},

	// verifica si el cliente estaba en la cola de alta prioridad de clientes deconectados.
	// Si estaba entonces lo pone al comienzo de la cola general
	verificarReconexion: function(idCliente){

		var clienteProdigo = this.colaOffline.find((cliente) => {
			return cliente.id == idCliente;
		});

		if (clienteProdigo){
			this.colaGeneral.unshift(clienteProdigo);
			this.colaOffline.splice(this.colaOffline.indexOf(clienteProdigo), 1);
		}
	},

	sacarCliente: function(cliente){
		var index = this.colaGeneral.indexOf(cliente);

		if (index > -1) {

    		 this.colaGeneral.splice(index, 1)
		}
		else
			log.error("esto no debería pasar en: sacarCliente")
	},

	agregarCaja: function(nroCaja){

		// Instanciamos una nueva caja y la agregamos a la lista de cajas disponibles
		var nuevaCaja = new Caja(nroCaja);
		this.cajas.push(nuevaCaja);

		// Llamamos a MAXIMO_POR_CAJA personas para que se acerquen
		for (let i = MAXIMO_POR_CAJA; i > 0; i--) {
			this.llamarCliente(nuevaCaja)
		}
	},

	abrirCaja: function(nroCaja){
		// Si existe y está deshabilitada la habilitamos, llamamos clientes para la caja recien habilitada, hasta completarla
		// Si no existe la insertamos	

		var caja = this.getCaja(nroCaja);

		if(caja){
			caja.atendiendo = true

			var cantidadALlamar = MAXIMO_POR_CAJA - caja.cola.length

			// Llamamos a MAXIMO_POR_CAJA personas para que se acerquen
			for (let i = cantidadALlamar; i > 0; i--) {
				this.llamarCliente(caja)
			}
		}
		else
			this.agregarCaja(nroCaja)
	},

	cerrarCaja: function(nroCaja){
		var caja = this.getCaja(nroCaja);

		if(!caja)
			log.error("esto no debería pasar en: cerrarCaja")

		caja.atendiendo = false
	},

	llamarCliente: function(caja){

		if(!caja.atendiendo)
			log.error("esto no debería pasar en: llamarCliente")

		// sacamos un cliente de la cola general
		//redisClient.lpop('generalqueue');
		var cliente = this.colaGeneral.shift();

		// Si hay algun cliente 
		if (cliente){

			if (cliente.conectado){
				// Lo agregamos a la cola de la caja
				caja.cola.push(cliente);

				// Y le asignamos el número de la caja a la cual tiene que ir
				cliente.caja = caja.numero
			} else {
				// Si no está conectado queda en una cola especial con alta prioridad
				this.colaOffline.push(cliente);
				// Y se llama a otro cliente
				this.llamarCliente(caja);
			}

		}
	},

	llamarOtroCliente: function(idCaja) {
	 	var caja = this.getCaja(idCaja)

	 	if(!caja)
	 		log.error("esto no debería pasar en: llamarOtroCliente")

	 	this.llamarCliente(caja)
	},

	atendiCliente: function(nroCaja, idCliente){

		// Buscamos la caja con ese nro de caja
		var caja = this.getCaja(nroCaja);

		if (!caja)
			log.error("esto no debería pasar 1 en: atendiCliente")

		// Buscamos la cliente dentro de la cola de esa caja
		var cliente = caja.getCliente(idCliente);
		
		if (!cliente)
			log.error("esto no debería pasar 2 en: atendiCliente")

		// Sacamos al cliente de la caja
		caja.sacarCliente(cliente);

		// Llamamos uno nuevo
		this.llamarCliente(caja)
	},

	hacerFila: function(idCliente){

		// Agrego al cliente a la cola general
		var nuevoCliente = new Cliente(idCliente);

		//redisClient.rpush('generalqueue', nuevoCliente.id);
		this.colaGeneral.push(nuevoCliente);

		var cajasQuePuedenAtender = []

		// Me fijo si alguna caja está en condiciones de atender a un cliente nuevo
		this.cajas.forEach((caja) => {
			if(caja.puedeAtenderNuevoCliente())
				cajasQuePuedenAtender.push(caja)
		})

		// De entre todas las cajas que pueden atender, tomo la que menos clientes tenga en su cola
		var cajaElegida

		if (cajasQuePuedenAtender.length > 0)
			cajaElegida = cajasQuePuedenAtender[0]

		cajasQuePuedenAtender.forEach((caja) =>{
			if(cajaElegida.cola.length > caja.cola.length)
				cajaElegida = caja
		})

		if (!cajaElegida)
			log.error("alguien está queriendo hacer la fila antes de que haya una caja habilitada")
		else
			this.llamarCliente(cajaElegida)
	},

	salirFila: function(idCliente){

		// Buscamos al cliente en la cola general
		// Si está lo sacamos y FIN
		var cliente = this.getCliente(idCliente);
		if (cliente)
			this.sacarCliente(cliente);
		else
		{
			// SI no:
			// Buscamos al cliente en las colas de las cajas
			// Si está lo sacamos y llamamos a alguien más para esa caja
			this.cajas.forEach((caja) => {
				cliente = caja.getCliente(idCliente);
				if(cliente)
				{
					caja.sacarCliente(cliente);
					if(caja.puedeAtenderNuevoCliente())
						this.llamarCliente(caja);

					return // TODO: Este return corta el forEach? (debería)
				}
			})
		}
	},

	clienteDesconectado: function(idCliente){

		//Me fijo si el cliente estaba en la cola general
		var cliente = this.getCliente(idCliente);

		if (cliente){
			cliente.conectado = false;
		}
	},

	retrasarme: function(idCliente){

		// TODO: Pensar bien está funcion.

		// Buscamos al cliente en la cola general
		// Si está lo retrasamos
		var cliente = this.getCliente(idCliente);
		if (cliente)
		{	
			
			cantidadLugaresARetrasar = cliente.retrasoPersonas;

			// Incrementamos la cantidad de personas que van a adelantarsele si se vuelve a atrasar
			cliente.retrasoPersonas = cliente.retrasoPersonas + 1;

			//retrasarNLugares(this.colaGeneral, cliente, cantidadLugaresARetrasar)
		}
		else
		{
			// SI no:
			// Buscamos al cliente en las colas de las cajas
			// Cuando lo encontramos lo movemos al final de la cola de cajas, y llamamos a un nuevo
		}
	},

	// EN desuso
	imprimir: function(){
		// Imprime un resumen general del estado de las colas
		
		var resumen = "----- COLA GENERAL ------ " + "\n" + "\n";

		this.colaGeneral.forEach((cliente) => {
			resumen = resumen + "-" + cliente.id + "\n"
		});

		resumen = resumen + "\n";

		this.cajas.forEach((caja) => {
			resumen = resumen + `----- CAJA ${caja.numero} ------ Atendiendo: ${caja.atendiendo}` + "\n" + "\n";

			caja.cola.forEach((cliente) => {
				resumen = resumen + "-" + cliente.id + "\n"
			})
		});

		return resumen
	},

	getTiempoPromedioAtencion: function(){
		//Debería devolver el tiempo promedio de atencion en minutos
		//Lo consideraría desde que un cliente entra a la cola general hasta que es llamado a una caja
		return 5
	},

	getColaGeneral: function(){
		return {
			colaGeneral: this.colaGeneral,
			tiempoPromedioAtencion: this.getTiempoPromedioAtencion()
		};
	},

	getObjetoColas: function(){
		// Retorna un objeto con toda la info que necesitan los clientes para saber que hacer
		// NMR: Por ahora no es necesario, se puede retornar todo el manager y listo.
		var objeto = {}
		objeto.colaGeneral = this.colaGeneral
		objeto.cajas = []

		this.cajas.forEach((caja) => {

			//A los clientes solo le interesan las cajas que están habilitadas
			if (caja.atendiendo){
				var cajaNueva = {}

				cajaNueva.numero = caja.numero
				cajaNueva.cola = caja.cola

				objeto.cajas.push(cajaNueva)
			}

		})

		//return objeto
		//Hardcodeo para pruebas
		//this.colaGeneral = [1,2,3,4,6];
		return {colaGeneral: [1,2,3,4,5,6], cajas: [{numero: 4, cola: []}, {numero: 5, cola: []}]}
	}
}


export default colaManager