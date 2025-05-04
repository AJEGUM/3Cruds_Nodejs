//Es el punto de entrada del servidor backend. Su princiapl funcion es iniciar la aplicacion importando el modulo principal app.js. Ademas, utiliza el paquete dotenv para leer variables de entorno desde un archivo .env, lo cual permite configurar dinamicamente el puerto (PORT) y otras variables sensibles sin modificar el codigo. El metodo listen() arranca el servidor y deja la API disponible, mostrandoo mensaje en consola que indica que el servidor esta activo y en que URL local puede ser accedio. ESTE ARCHIVO ES ESENCIAL PARA PONER EN MARCHA TODO EL ECOSISTEMA DEL BACKEND

//Se importa la configuracion princiapl de la aplicacion desde el achivo app.js ubicado en la carpeta src
const app = require('./src/app')

//Se cargan las variables de entorno definidas en el archivo .env
require('dotenv').config()

//Se define el puerto en el que se ejecutara el servidor. Si no hay una variable de entorno PORT, usuara el 3000 por defecto
const PORT = process.env.PORT || 3000

//Se inicia el servidor en el puerto especificado y muestra un mensaje en consola cuando este corriendo correctamente
app.listen(PORT, () =>{
    console.log(`Servidor corriendo en http://localhost:${PORT} `)
})