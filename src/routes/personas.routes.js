//Este archivo el cual trabaja al lado del servidor es el encargado de organizar las peticiones relacionadas con la entidad personas, permitiendo realizar las operaciones CRUD. Actua como intermediario entre las solicitudes HTTP recibidas y con la logica de base de datos implementada en el controlador "crud.controller"


//Importar el modulo express
const express = require("express")

//Crear un nuevo router de Express para manejrar rutas de manera modular
const router = express.Router()

//Importa el controlador generico para operaciones CRUD
const CrudController = require('../controllers/crud.controller')

//Instanciar una nueva instancia del controlador para usar sus metodos
const crud = new CrudController()

//Definir el nombre de la tabla en la base de datos sobre la se operara
const tabla = 'personas'

//Definir el nombre del campo identificador unico de la tabla
const idCampo = 'id_persona'

//Ruta para obtener todos los registros de peronas
router.get('/', async (req, res) =>{
    try{
        //Utilizar el metodo obtenerTodos del controlador para traer todos los registros
        const personas = await crud.obtenerTodos(tabla)

        //Respuesta con el arreglo de personas en formato JSON
        res.json(personas)
    }catch(error){
        console.error('Error en GET /personas:', error);
        res.status(500).json({ 
            error: 'Error al obtener las personas',
            detalle: error.message 
        })
    }
})


//Ruta para obtener una persona especifica por su ID
router.get('/:id', async (req, res) =>{
    try{
        //Utilizar el metodo obtenerUno con el ID recibido en la URL
        const persona = await crud.obtenerUno(tabla, idCampo, req.params.id)

        //Respuesta con los datos de la persona en formato JSON
        res.json(persona)
    }catch(error){
        //Manejar errores de servidor
        res.status(500).json({ error: error.message })
    }
})

//Ruta para crear una nueva persona (registro nuevo en la base de datos)
router.post('/', async(req, res) =>{
    try{
        //Validar que se reciban datos
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No se recibieron datos para crear la persona' });
        }

        //Utilizar el metodo crear con los datos enviados en el cuerpo del request
        const nuevaPersona = await crud.crear(tabla, req.body)

        //Respuesta con el nuevo registro creado y codigo 201 (creado)
        res.status(201).json({
            ...nuevaPersona,
            id: nuevaPersona.id_persona
        })
    }catch(error){
        console.error('Error en POST /personas:', error);
        res.status(500).json({ 
            error: 'Error al crear la persona',
            detalle: error.message 
        })
    }
})

//Ruta para actualizar una persona existente (por ID)
router.put('/:id', async (req, res) =>{
    try{
        //Utilizar el metodo actualizar con el ID y los nuevos datos del cuerpo
        const personaActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body)

        //Respuesta con el registro actualizado
        res.json(personaActualizada)
    }catch(error){
        //Manejar errores de servidor
        res.status(500).json({ error: error.message })
    }
})

//Ruta para eliminar una persona de la base de datos (por ID)
router.delete('/:id', async (req, res) =>{
    try{
        //Utilizar el metodo eliminar con el ID recibido
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id)
    
        //Respuesta con un mensaje o confirmacion de eliminacion
        res.json(resultado)
    }catch(error){
        res.status(500).json({ error: error.message})
    }
})

//Exportar el router para que pueda ser usado en la aplicacion principal
module.exports = router