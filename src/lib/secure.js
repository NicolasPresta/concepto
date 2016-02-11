/**
 * Created by Artiom on 03/02/2016.
 */
import jwt from "jsonwebtoken"
import device from 'device'
import appConfig from './config'

var secureManager = {

	getToken: function(token){
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, appConfig.app_secret, function(err, decoded) {
				if (err) {
					return {
						success: false,
						code: 403,
						message: 'Fallo de autenticación'
					};
				} else {
					return {
						success: true,
						data: decoded
					};
				}
			});
		} else {
			return {
				success: false,
				code: 403,
				message: 'Permiso denegado'
			};
		}
	},
	handShake: function(userAgent, idDispositivo){
		//Verifica que el dispositivo sea un móvil...
		let clientDevice = device(userAgent);
		//Impostando el user-agent se podría evitar la validación
		//Faltaría verificar uuid, o ver otro approach de seguridad
		if (clientDevice.is('phone') || clientDevice.is('tablet')){
			var payload = {
				user: 'guest',
				uuid: idDispositivo
			};
			return {
				code: 200,
				success: true,
				token: jwt.sign(payload, appConfig.app_secret, {expiresIn: "1d"})
			}
		} else {
			return {
				code: 403,
				success: false,
				message: 'No se ha podido validar el dispositivo'
			}
		}
	},
	//Para pruebas desde navegador
	testHandshake: function(algunId){
		return {
			code: 200,
			success: true,
			token: jwt.sign(algunId, appConfig.app_secret)
		}
	}
};

export default secureManager;
