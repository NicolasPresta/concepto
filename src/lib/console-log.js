// TODO: 	- Bajar opcionalmente a un archivo. (ver definicion del packete Log)
//			- Poder setear el archivo al cual se baja desde un archivo de configuración
//			- Poder setear el nivel que se quiere logear desde el archivo de configuración


import Log from 'log'
import colors from 'colors'

const log = new Log('info');

colors.setTheme({
  debug: 'bgCyan',
  info: 'bgBlue',
  notice: 'bgBlue',
  warning: 'bgYellow',
  error: 'bgRed',
  critical: 'bgRed',
  alert: 'bgRed',
  emergency: 'bgMagenta'
});


var colorLoger = {

	debug: function(msj){
		log.debug(msj.debug)
	},

	info: function(msj){
		log.info(msj.info)
	},

	notice: function(msj){
		log.notice(msj.notice)
	},

	warning: function(msj){
		log.warning(msj.warning)
	},

	error: function(msj){
		log.error(msj.error)
	},

	critical: function(msj){
		log.critical(msj.critical)
	},

	alert: function(msj){
		log.alert(msj.alert)
	},

	emergency: function(msj){
		log.emergency(msj.emergency)
	}
}


export default colorLoger