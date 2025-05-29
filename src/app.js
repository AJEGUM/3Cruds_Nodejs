const express = require('express')
//Importa el framework Express para crear el servidor

const cors = require('cors')
//Importa CORS para permitir solicitudes desde otros dominios (muy util cuando el frontend y backend estan separados)

const app = express()
//Crear una instancia de aplicacion express

const imagenesRoutes = require('./routes/imagenes.routes')
//Importa las rutas para el manejo de imagenes desde el archivo correspondiente

//Middlewares
app.use(cors())
//Habilita los CORS (permite que el servidor reciba peticiones desde otros origenes)

app.use(express.json({ limit: '50mb'}))
//Permite recibir datos en formato JSON, estableciendo un limite de 50MB (ideal para datos grandes como imagenes en Base64)

app.use(express.urlencoded({ extended: true, limit: '50mb'}))
//Permite recibir datos codificados desde formularios (como los enviados por POST desde HTML), tambien con limite de 50MB

//Rutas
app.use('/api/personas', require('./routes/personas.routes'))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/proveedor', require('./routes/proveedor.routes'))
app.use('/api/psicologos', require('./routes/psicologos.routes'))
app.use('/api/imagenes', imagenesRoutes)
//Asocia todas las rutas de personas bajo el prefijo /api/personas

module.exports = app
//Exporta la app configurada para ser utilziada