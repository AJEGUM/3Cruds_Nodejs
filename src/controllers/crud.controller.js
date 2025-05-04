const db = require('../config/db')
//Se importa la conexion a la base de datos desde archivo db.js que esta en la carpeta config

//Se crea una clase llamada CrudController que manejara todas las operaciones CRUD
class CrudController {

    //Metodo para obtener todos los registros de una tabla
    async obtenerTodos(tabla){
        try{
            //Realiza una consulta SQL para seleccionar todos los registros de la tabla indicada
            const [resultados] = await db.query(`SELECT * FROM ??`, [tabla])
            return resultados; //Devuelve la array de resultados
        }catch (error){
            console.error('Error en obtenerTodos:', error);
            throw error; //Lanza el error para que sea manejado en otro lugar
        }
    }

    async obtenerUno(tabla, idCampo, id){
        try{
            //Se utiliza el doble interrogante ?? para escapar nombres de tabla/campo, y un interrogante ? para el valor
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id])
            return resultado[0] //Devuelve solo el primer resultado
        }catch (error){
            throw error; //Lanza el error para que sea manejado en otro lugar
        }
    }

    async crear(tabla, data){
        try{
            //Validar que se reciban datos
            if (!data || Object.keys(data).length === 0) {
                throw new Error('No se recibieron datos para crear el registro');
            }

            //Preparar los datos para la inserción
            const datosPreparados = {
                nombre: data.nombre || null,
                apellido: data.apellido || null,
                tipo_identificacion: data.tipo_identificacion || null,
                nuip: data.nuip || null,
                emai: data.emai || null, // Usamos emai directamente
                clave: data.clave ? parseFloat(data.clave) : null,
                salario: data.salario ? parseFloat(data.salario) : null,
                activo: data.activo !== undefined ? Boolean(data.activo) : true,
                fecha_registro: data.fecha_registro || new Date().toISOString().split('T')[0]
            };

            //Inserta datos en una tabla indicada
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, datosPreparados])
            
            //Verificar si se insertó correctamente
            if (!resultado || !resultado.insertId) {
                throw new Error('No se pudo crear el registro');
            }

            //Devuelve el objeto creado, incluyendo el ID generado automaticamente
            return {...datosPreparados, id_persona: resultado.insertId}
        }catch (error){
            console.error('Error en crear:', error);
            throw error;
        }
    }

    async actualizar(tabla, idCampo, id, data){
        try{
            //Ejecuta una consulta UPDATE con los datos nuevos
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id])
            //Si no afecto ninguna fila, es que el registro no existia
            if(resultado.affectedRows === 0){
                throw new Error("Registro no encontrado")
            }
            //Devuelve un registro actualizado
            return await this.obtenerUno(tabla, idCampo, id)
        }catch (error){
            throw error;
        }
    }

    async eliminar(tabla, idCampo, id){
        try{
            //Ejecita la eliminacion del registro
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id])
            //Si no se elimino ninguna fila, es que el ID no existe
            if(resultado.affectedRows === 0){
                throw new Error("Registro no encontrado")
            }
            //Devuelve un mensaje de exito
            return {mensaje: "Registro eliminado correctamente"}
        }catch (error){
            throw error;
        }
    }

}

//Se exporta la clase para poder utilizarla en otros archivos
module.exports = CrudController