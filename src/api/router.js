import express from 'express'
import log from '../lib/log'
import secureManager from '../lib/secure'

const router = express.Router();

// Puntos de entrada REST
//Handshake para dispositivos
router.post('/handshake', (req, res) => {
	log.debug(req.body);

	//TODO: verificar de algún modo la autenticidad del uuid
	let userAgent = req.headers['user-agent'];
	let uuid = req.body.uuid;

	let response = secureManager.handShake(userAgent, uuid);
	res.status(response.code).json(response);
});

router.post('/authCashbox', (req, res) => {
	log.debug(req.body);

	let idCaja = req.body.idCaja;
	let pass = req.body.password;

	let response = secureManager.authCashbox(idCaja, pass);
	res.status(response.code).json(response);
});

router.post('/testHandshake', (req, res) => {
	log.debug(req.body);

	let uuid = req.body.uuid;
	let response = secureManager.testHandshake(uuid);
	res.status(response.code).json(response);
});

export default router