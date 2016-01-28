const MAXIMO_POR_CAJA = 2


function Caja(nro){
	this.numero = nro
	this.cola = []
	this.atendiendo = true
	this.puedeAtenderNuevoCliente = function(){
		if (this.cola.length < MAXIMO_POR_CAJA)

	}
}


function Cliente(id){
	this.id = id
	this.cantidadRetrasos = 0
}

var colaManager = {

	cajas: [],
	colaGeneral: [],

	agregarCaja: function(nroCaja){
		// Instanciamos una nueva caja y la agregamos a la lista de cajas disponibles
		nuevaCaja = new Caja(nroCaja)
		this.cajas.push(nuevaCaja)

		// Llamamos a MAXIMO_POR_CAJA personas para que se acerquen
		for (var i = MAXIMO_POR_CAJA; i >= 0; i--) {
			this.llamarCliente(nuevaCaja)
		};
	},


	llamarCliente: function(caja){

		if(!caja.atendiendo)
			return "WTF"

		// sacamos un cliente de la cola general
		cliente = this.colaGeneral.shift();

		// Si hay algun cliente 
		if (cliente){
			// Lo agregamos a la cola de la caja
			caja.cola.push(cliente)
			// Y le asignamos el número de la caja a la cual tiene que ir
			cliente.caja = caja.numero
		}
	},

	atendiCliente: function(nroCaja, idCliente){

		// Buscamos la caja con ese nro de caja
		caja = this.cajas.find((caja) => {
			if(caja.numero == nroCaja)
				return true
			else
				return false
		})

		if (!caja)
			return "WTF"

		// Buscamos la cliente dentro de la cola de esa caja
		cliente = caja.cola.find((cliente) => {
			if(cliente.id == idCliente)
				return true
			else
				return false
		})

		if (!cliente)
			return "WTF2"

		// Sacamos al cliente de la caja
		caja.SacarCliente(cliente)

		// Llamamos uno nuevo
		this.llamarCliente(caja)

	},

	hacerFila: function(idCliente){
		// Agrego al cliente a la cola general
		nuevoCliente = new Cliente(idCliente);
		this.colaGeneral.push(nuevoCliente);

		// Me fijo si alguna caja está en condiciones de atender a un cliente nuevo
		this.Cajas.forEach((caja) => {
			if(caja.puedeAtenderNuevoCliente())
				this.llamarCliente(caja)
		})
	}

	// TODO: retrasarme, salir de fila, dar de baja una caja, calcular tiempos de espera, etc

}





export default colaManager