//Este archivo sirve para gestionar la subida de archivos (como imagenes) desde formularios frontend, utilizando multer con almacenamiento en memoria, para luego procesarlo o guardarlos en la base de datos sin escribirlos en disco

const multer =  require('multer')
//Importa el modulo "multer", que sirve para manejar la subida de archivos desde formularios en NODE.JS

//Almacenamiento en memoria
const storage = multer.memoryStorage()
//Se define una estrategia de almacenamiento en memoria (RAM) temporal para los archivos subidos. Est significa que los archivos no se guardan en el disco, sino en un buffer en memoria

const upload = multer({ storage })
//Se crea una instancia del middleware de subida con la confifuracion de almacenamiento definida (en memoria). Esta instancia puede ser utilizada en las rutas donde se aceptan archivos. por ejemplo, las imagenes de pefil.

module,exports = upload
//Se exporta la configuracion para poder utiliarla en otros archivos del proyecto (como en rutas EXPRESS)