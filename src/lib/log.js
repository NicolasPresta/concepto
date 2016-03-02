// TODO: 	- Bajar opcionalmente a un archivo. (ver definicion del packete Log)
//			- Poder setear el archivo al cual se baja desde un archivo de configuración
//			- Poder setear el nivel que se quiere logear desde el archivo de configuración


import Log from 'log'
import colors from 'colors'
import appConfig from 'src/config/config'

const log = new Log(appConfig.LogLevel);

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
		log.debug(msj)
	},

	info: function(msj){
		log.info(msj)
	},

	notice: function(msj){
		log.notice(msj)
	},

	warning: function(msj){
		log.warning(msj)
	},

	error: function(msj){
		log.error(msj)
	},

	critical: function(msj){
		log.critical(msj)
	},

	alert: function(msj){
		log.alert(msj)
	},

	emergency: function(msj){
		log.emergency(msj)
	}
}


export default colorLoger