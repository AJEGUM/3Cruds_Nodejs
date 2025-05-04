//VARIABLES GLOBALES

const API_URL = 'http://localhost:3000/api'




//Arreglo donde se almacenaran las personas traidas desde la API
let personas = []

//Varible para determinar si estamos editando o creando
let modoEdicion = false 

// ==============
//ELEMENTOS DEL DOOM
// ==============

//Referencia al formulario de personas
const form = document.querySelector('#personaForm')

//Cuerpo de la tabla donde se insertaran 
const tablaBody = document.querySelector('#tablaPersonasBody')

//Template HTML para generar filas de tabla
const template = document.querySelector('#template')

//Boton para guardar (crear o actualizar)
const btnGuardar = document.querySelector('#btnGuardar')

//Boton para cancelar la edicion 
const btnCancelar = document.querySelector('#btnCancelar')

//input de imagen y su previsualizacion
const inputImagen = document.querySelector('#imagen')
const previewImagen = document.querySelector('#previewImagen')

// ================
// CAMPOS DEL FOMULARIO
// ================

const campos = {
    id: document.querySelector('#id_persona'),
    nombre: document.querySelector('#nombre'),
    apellido: document.querySelector('#apellido'),
    tipo_identificacion: document.querySelector('#tipo_identificacion'),
    nuip: document.querySelector('#nuip'),
    emai: document.querySelector('#emai'),
    clave: document.querySelector('#clave'),
    salario: document.querySelector('#salario'),
    activo: document.querySelector('#activo')
}

// ======================
// EVENTOS PRINCIPALES
// ======================

document.addEventListener('DOMContentLoaded', () =>{
    cargarPersonas() //Cargar lista inicial
    form.addEventListener('submit', manejarSubmit) //Guardar datos
    btnCancelar.addEventListener('click', resetearFormulario) //Cancelar edicion
    inputImagen.addEventListener('change', manejarCambioImagen) //Cargar imagen
})

// ====================
// FUNCIONES DE LOGICA
// =====================

//Carga todas las personas desde la API
async function cargarPersonas() {
    try{
        const response = await fetch(`${API_URL}/personas`)
        personas = await response.json()
        mostrarPersonas()
    }catch(error){
        console.error('Error al cargar personas: ', error)
    }
}

//Muestra en la tabla todas las personas cargadas
async function mostrarPersonas() {
    tablaBody.innerHTML = '' //Limpiar tabla

    personas.forEach(async persona => {
        const clone = template.content.cloneNode(true) //Clonar template
        const celdas = clone.querySelectorAll('td')

        //Llenar celdas con datos de la persona
        celdas[0].textContent = persona.id_persona
        celdas[1].textContent = persona.nombre
        celdas[2].textContent = persona.apellido
        celdas[3].textContent = persona.emai

        //Imagen por defecto
        let imagenHTML = 'Sin imagen'

        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`)
            const data = await response.json()
            if(data.imagen){
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style="max-width: 100px; max-height: 100px">`

            }
        }catch(error){
            console.error('Error al cargar imagen', error)
        }

        celdas[4].innerHTML = imagenHTML

        //Botones de accion
        const btnEditar = clone.querySelector('.btn-editar')
        const btnEliminar = clone.querySelector('.btn-eliminar')

        btnEditar.addEventListener('click', () => editarPersona(persona))
        btnEliminar.addEventListener('click', () => eliminarPersona(persona.id_persona))

        tablaBody.appendChild(clone)
    })
}

//Manejo del submit del formulario (crear o actualiar persona)
async function manejarSubmit(e) {
    e.preventDefault()

    //Recolectar datos desde el formulario
    const persona = {
        nombre: campos.nombre.value,
        apellido: campos.apellido.value,
        tipo_identificacion: campos.tipo_identificacion.value,
        nuip: campos.nuip.value,
        emai: campos.emai.value,
        clave: campos.clave.value,
        salario: parseFloat(campos.salario.value),
        activo: campos.activo.checked
    }

    try{
        if(modoEdicion){
            persona.id_persona = campos.id.value

            if(inputImagen.files[0]) {
                const imagenBase64 = await convertirImagenABase64(inputImagen.files[0])
                await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ imagen: imagenBase64})
                })
            }

            await actualizarPersona(persona)
        }else{
            const response = await crearPersona(persona)

            if(!response.id) {
                throw new Error('El servidor no devolvio el ID de la persona creada')
            }

            if(inputImagen.files[0]) {
                const imagenBase64 = await convertirImagenABase64(inputImagen.files[0])
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${response.id}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ imagen: imagenBase64})
                })
            }
        }

        resetearFormulario()
        cargarPersonas()
    }catch(error){
        console.error('Error al guardar persona: ', error)
        alert('Error al guardar los datos: ', error.message)
    }
}

//Crea una nueva persona en la base de datos
async function crearPersona(persona) {
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    })

    if(!response.ok){
        throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    if(!data.id){
        throw new Error('La respuesta del servidor no contiene el ID de la persona')
    }

    return data
}

//Actualiza los datos de una persona existente
async function actualizarPersona(persona) {
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    })

    const data = await response.json()
    return data
}

//Elimina una persona y su imagen asociada
async function eliminarPersona(id) {
    if(!confirm('¿Esta seguro de eliminar esta persona?')) return

    try{
        await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`,{
            method: 'DELETE'
        })
        await fetch(`${API_URL}/personas/${id}`, {
            method: 'DELETE'
        })
        
        cargarPersonas() //Recargar la lista
    }catch(error){
        console.error('Error al eliminar persona: ', error)
        alert('Error al eliminar la persona: ' + error.message)
    }
}

//Carga los datos de la persona al formulario para editar
async function editarPersona(persona) {
    modoEdicion = true

    //Cargr campos
    campos.id.value = persona.id_persona
    campos.nombre.value = persona.nombre
    campos.apellido.value = persona.apellido
    campos.tipo_identificacion.value = persona.tipo_identificacion
    campos.nuip.value = persona.nuip
    campos.emai.value = persona.emai
    campos.clave.value = persona.clave
    campos.salario.value = persona.salario
    campos.activo.value = persona.activo

    //Cargar imagen
    try{
        const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`)
        const data = await response.json()

        if(data.imagen){
            previewImagen.src = `data:image/jpeg;base64,${data.imagen}`
            previewImagen.style.display = 'block'
        }else{
            previewImagen.style.display = 'none'
            previewImagen.src = ''
        }
    }catch(error){
        console.error('Error al cargar imagen:', error)
        previewImagen.style.display = 'none'
        previewImagen.src = ''
    }

    btnGuardar.textContent = 'Actualizar'
}

//Restablece el formulario al estado original
function resetearFormulario(){
    modoEdicion = false
    form.reset()
    previewImagen.style.display = 'none'
    previewImagen.src = ''
    btnGuardar.textContent = 'Guardar'
}

//Previsualizacion imagen cuando se selecciona una
function manejarCambioImagen(e){
    const file = e.target.files[0]

    if(file){
        const reader = new FileReader()
        reader.onload = function(e){
            previewImagen.src = e.target.result
            previewImagen.style.display = 'block'
        }
        reader.readAsDataURL(file)
    }else{
        previewImagen.style.display = 'none'
        previewImagen.src = ''
    }
}

//Convierte una imagen a Base64 para enviar al servidor
function convertirImagenABase64(file){
    return new Promise((resolver, reject) =>{
        const reader = new FileReader()

        reader.readAsDataURL(file)

        reader.onload = () =>{
            const base64 = reader.result.split(',')[1] //Quitar prefijo MIME
            resolver(base64)
        }

        reader.onerror = error => reject(error)
    })
}