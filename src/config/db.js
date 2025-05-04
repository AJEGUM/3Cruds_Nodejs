//AQUI ESTARA LA CONFIGURACION PARA LA CONEXION A LA BASE DE DATOS

//Se importa la version de mysql que trabaja con promesas esto sirve para utilizar await y async
const mysql = require('mysql2/promise');

//Se importa dotenv para manejar variables de entorno desde el archivo .env
const dotenv = require('dotenv'); //dotenv sirve para leer valores con informacion sensible como: Usuarios, contraseñas o nombre de bases de datos y asi se evita colocar informacion sensible dentro del codigo

//Cargar variables definidas en .env
dotenv.config(); //Esta linea leer el archivo .env y carga sus valores en process.env por ejemplo: process.env.DB_USER

//Se crea un "pool" para la conexion de base de datos. createPool() crea un grupo de conexiones reutilizables, lo cual es mas eficiente que abrir y cerrar una conexion para la consulta 
const pool = mysql.createPool({
    host: process.env.DB_HOST,              //Host donde esta la base de datos
    user: process.env.DB_USER,              //Usuario de la base de datos
    password: process.env.DB_PASSWORD,      //Contraseña de la base de datos
    database: process.env.DB_NAME,          //Nombre de la base de datos
    waitForConnections: true,               //Espera cuando las conexiones estan ocupadas
    connectionLimit: 10,                    //Limite de conexiones al mismo tiempo
    queueLimit: 0                           //No hay limite de espera en la cola
});  

//Las variables host, user, entre otras; vienen del archivo .env, lo que hace que el codigo sea mas seguro y configurable
    
//Exportar el pool para usarlo en otros archivos del proyecto
module.exports = pool;
