const MAXIMO_POR_CAJA = 2
const RETRASO_MINIMO = 2

function Caja(nro){

	this.numero = nro
	this.cola = []
	this.atendiendo = true

	this.puedeAtenderNuevoCliente = function(){
		if (this.cola.length < MAXIMO_POR_CAJA & this.atendiendo)
			return true
		else
			return false
	}

	this.getCliente = function(idCliente){
		var buscado = this.cola.find((cliente) => {
			if(cliente.id == idCliente)
				return true
			else
				return false
		})

		return buscado
	}

	this.sacarCliente = function(cliente){
		var index = this.cola.indexOf(cliente)

		if (index > -1) {
    		 this.cola.splice(index, 1)
		}
		else
			return "WTF"
	}
}


function Cliente(id){
	this.id = id
	this.retrasoPersonas = RETRASO_MINIMO
}


var colaManager = {

	cajas: [],
	colaGeneral: [],

	getCaja: function(nroCaja){
		var buscada = this.cajas.find((caja) => {
			if(caja.numero == nroCaja)
				return true
			else
				return false
		})

		return buscada
	},

	getCliente: function(idCliente){
		var buscado = this.colaGeneral.find((cliente) => {
			if(cliente.id == idCliente)
				return true
			else
				return false
		})

		return buscado
	},

	sacarCliente: function(cliente){
		var index = this.colaGeneral.indexOf(cliente)

		if (index > -1) {
    		 this.colaGeneral.splice(index, 1)
		}
		else
			return "WTF"
	},

	agregarCaja: function(nroCaja){

		// Instanciamos una nueva caja y la agregamos a la lista de cajas disponibles
		var nuevaCaja = new Caja(nroCaja)
		this.cajas.push(nuevaCaja)

		// Llamamos a MAXIMO_POR_CAJA personas para que se acerquen
		for (let i = MAXIMO_POR_CAJA; i > 0; i--) {
			this.llamarCliente(nuevaCaja)
		}
	},

	abrirCaja: function(nroCaja){
		// Si existe y está deshabilitada la habilitamos, llamamos clientes para la caja recien habilitada, hasta completarla
		// Si no existe la insertamos	

		var caja = this.getCaja(nroCaja)

		if(caja){
			caja.atendiendo = true

			var cantidadALlamar = MAXIMO_POR_CAJA - caja.cola.length()

			// Llamamos a MAXIMO_POR_CAJA personas para que se acerquen
			for (let i = MAXIMO_POR_CAJA; i > 0; i--) {
				this.llamarCliente(nuevaCaja)
			}
		}
		else
			this.agregarCaja(nroCaja)
	},

	cerrarCaja: function(nroCaja){
		var caja = this.getCaja(nroCaja)

		if(!caja)
			return "WTF"

		caja.atendiendo = false
	},

	llamarCliente: function(caja){

		if(!caja.atendiendo)
			return "WTF"

		// sacamos un cliente de la cola general
		var cliente = this.colaGeneral.shift()

		// Si hay algun cliente 
		if (cliente){

			// Lo agregamos a la cola de la caja
			caja.cola.push(cliente)

			// Y le asignamos el número de la caja a la cual tiene que ir
			cliente.caja = caja.numero
		}
	},

	llamarOtroCliente: function(idCaja) {
	 	var caja = this.getCaja(idCaja)

	 	if(!caja)
	 		return "WTF"

	 	this.llamarCliente(caja)
	},

	atendiCliente: function(nroCaja, idCliente){

		// Buscamos la caja con ese nro de caja
		var caja = this.getCaja(nroCaja)

		if (!caja)
			return "WTF"

		// Buscamos la cliente dentro de la cola de esa caja
		var cliente = caja.getCliente(idCliente)
		
		if (!cliente)
			return "WTF2"

		// Sacamos al cliente de la caja
		caja.sacarCliente(cliente)

		// Llamamos uno nuevo
		this.llamarCliente(caja)
	},

	hacerFila: function(idCliente){

		// Agrego al cliente a la cola general
		var nuevoCliente = new Cliente(idCliente)

		this.colaGeneral.push(nuevoCliente)

		// Me fijo si alguna caja está en condiciones de atender a un cliente nuevo
		this.cajas.forEach((caja) => {
			if(caja.puedeAtenderNuevoCliente())
				this.llamarCliente(caja)
		})
	},

	salirFila: function(idCliente){

		// Buscamos al cliente en la cola general
		// Si está lo sacamos y FIN
		var cliente = this.getCliente(idCliente)
		if (cliente)
			this.sacarCliente(cliente)
		else
		{
			// SI no:
			// Buscamos al cliente en las colas de las cajas
			// Si está lo sacamos y llamamos a alguien más para esa caja
			this.cajas.forEach((caja) => {
				cliente = caja.getCliente(idCliente)
				if(cliente)
				{
					caja.sacarCliente(cliente)
					if(caja.puedeAtenderNuevoCliente())
						this.llamarCliente(caja)

					return // TODO: Este return corta el forEach? (debería)
				}
			})
		}
	},

	retrasarme: function(idCliente){

		// TODO: Pensar bien está funcion.

		// Buscamos al cliente en la cola general
		// Si está lo retrasamos
		var cliente = this.getCliente(idCliente)
		if (cliente)
		{	
			
			cantidadLugaresARetrasar = cliente.retrasoPersonas

			// Incrementamos la cantidad de personas que van a adelantarsele si se vuelve a atrasar
			cliente.retrasoPersonas = cliente.retrasoPersonas + 1

			//retrasarNLugares(this.colaGeneral, cliente, cantidadLugaresARetrasar)
		}
		else
		{
			// SI no:
			// Buscamos al cliente en las colas de las cajas
			// Cuando lo encontramos lo movemos al final de la cola de cajas, y llamamos a un nuevo
		}
	},

	imprimir: function(){
		// Imprime un resumen general del estado de las colas
		
		var resumen = "----- COLA GENERAL ------ " + "\n" + "\n"

		this.colaGeneral.forEach((cliente) => {
			resumen = resumen + "-" + cliente.id + "\n"
		})

		resumen = resumen + "\n"

		this.cajas.forEach((caja) => {
			resumen = resumen + `----- CAJA ${caja.numero} ------ Atendiendo: ${caja.atendiendo}` + "\n" + "\n"

			caja.cola.forEach((cliente) => {
				resumen = resumen + "-" + cliente.id + "\n"
			})
		})

		return resumen
	},




	// TODO: retrasarme, calcular tiempos de espera, etc
}


export default colaManager