import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000
const router = express.Router()

router.get('/eco/:param', (req, res) => {
  let algo = req.params.param

  res.json({pepe: algo})

})

app.use(router)

server.listen(port, () => console.log(`Server listening on port ${port}`))
