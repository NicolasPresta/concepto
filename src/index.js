// Imports
import http from 'http'
import express from 'express'
import semaforo from 'semaphore'
import Redis from 'ioredis'
import cola from './lib/cola.js'


// Definicion de constantes
const app = express()
const server = http.createServer(app)
//const port = process.env.PORT || 3000
const port = process.argv[2] || 3000
const router = express.Router()
//const sem = semaforo(1)
const redis = new Redis()


// Puntos de entrada de la API
router.get('/push/:param', (req, res) => {

	redis.set('foo', 'pedro de mendoza')

	let algo = req.params.param
   	cola.push(algo)
	res.json({cola: cola})

})

router.get('/shift', (req, res) => {
	
	redis.get('foo', function (err, result) {

	if (err)
		console.log(err)

  	console.log(result)

  	let elemento = cola.shift()
	res.json({cola: cola, elemento: elemento})
    })



})

app.use(router)



// Inicialiazmos el servidor
server.listen(port, () => console.log(`Server listening on port ${port}`))
