/**
 * Created by Artiom on 03/02/2016.
 */
import jwt from "jsonwebtoken"
import device from 'device'
import appConfig from 'src/config/config'

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

	// handshake con el dispositivo movil del usuario
	handShake: function(userAgent, idDispositivo){
		//Verifica que el dispositivo sea un móvil...
		let clientDevice = device(userAgent);

		//Impostando el user-agent se podría evitar la validación
		//Faltaría verificar uuid, o ver otro approach de seguridad
		if (clientDevice.is('phone') || clientDevice.is('tablet')){
			var payload = {
				user: 'cliente',
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

	//Las cajas van a funcionar desde la red interna del supermercado, por lo que no deberíamos preocuparnos demasiado por la seguridad
	authCashbox: function(idCaja, clave){
		//busco el id de la caja en la base y valido con la clave, si está ok, armo el payload con sus datos y le devuelvo el token
		var payload = {
				user: 'caja',
				uuid: idCaja
			};
		return {
				code: 200,
				success: true,
				token: jwt.sign(payload, appConfig.app_secret, {expiresIn: "1d"})
			}

	},

	//Para pruebas desde navegador, (no hace la comprobación de que sea un phone o tablet).
	testHandshake: function(idDispositivo){
		var payload = {
			user: 'cliente',
			uuid: idDispositivo
		};
		return {
			code: 200,
			success: true,
			token: jwt.sign(payload, appConfig.app_secret, {expiresIn: "1d"})
		}
	}
};

export default secureManager;
