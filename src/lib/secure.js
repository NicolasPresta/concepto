/**
 * Created by Artiom on 03/02/2016.
 */
import jwt from "jsonwebtoken"

var secureManager = {

	getToken: function(token){
		//var token = req.body.token || req.query.token || req.headers['x-access-token'];
		// decode token
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, APP_SECRET, function(err, decoded) {
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
					//req.decoded = decoded;
					//next();
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
	handShake: function(idDispositivo){
		return jwt.sign(idDispositivo, APP_SECRET, {expiresIn: '1 day'});
	}
};

export default secureManager;
