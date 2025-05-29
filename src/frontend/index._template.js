//Variables globales
const API_URL = 'http://localhost:3000/api' //URL base de la API backend
let personas = [] //Arreglo donde se almacenan las personas obtenidas del servidor

//ElemEntos del DOM
const personaForm = document.getElementById('personaForm') //Formulario principal
const tablaPersonasBody = document.getElementById('tablaPersonasBody') //Cuerpo de la tabla donde se listan personas
const btnCancelar = document.getElementById('btnCancelar') //Boton para limpiar el formulario
const imagenInput = document.getElementById('imagen') //input de imagen
const previewImagen = document.getElementById('previewImagen') //Imagen para previsualizar la subida

//Event Listeners
document.addEventListener('DOMContentLoaded', () =>{
    //Verificar si el usuario esta autenticado
    verificarAutenticacion()

    //Mostrar nombre del usuario si esta autenticado
    const usuarioNombre = localStorage.getItem('usuarioNombre')
    const usuarioApellido = localStorage.getItem('usuarioApellido')

    if(usuarioNombre && usuarioApellido){
        const infoUsuario = document.createElement('div')
        infoUsuario.innerHTML = `
            <p>Bienvenido, ${usuarioNombre} ${usuarioApellido} |
                <a href="#" id="btnCerrarSesion">Cerrar sesion</a>
            </p>
        `
        document.body.insertBefore(infoUsuario, document.body.firstChild)

        //Agregar listener para cerrar sesion
        document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion)
    }

    cargarPersonas()
})

personaForm.addEventListener('submit', manejarSubmit) //Enviar el formulario
btnCancelar.addEventListener('click', limpiarFormulario) //Boton de cancelar limpia el formulario
imagenInput.addEventListener('change', manejarImagen) //Cargar previsualizacion cuando se selecciona imagen

//Verificar autenticacion
function verificarAutenticacion(){
    const usuarioId = localStorage.getItem('usuarioId')

    if(!usuarioId){
        //Si no hay ID usuario, redirigir al login
        window.location.href = 'login.html'
        return
    }

    //Verificar con el servidor si el usuario es valido
    fetch(`${API_URL}/auth/verificar/${usuarioId}`)
    .then(response => {
        if(!response.ok){
            throw new Error('Sesion Invalida')
        }
        return response.json()
    })
    .then(data => {
        if(!data.success){
            //Si la verificacion falla, limpiar localstorage y redirigir
            localStorage.clear()
            window.location.href = 'login.html'
        }
    })
    .catch(error => {
        console.error('Error al verificar sesion: ', error)
        localStorage.clear()
        window.location.href = 'login.html'
    })
}

//Cerrar sesion
function cerrarSesion(e){
    e.preventDefault()

    //Limpiar datos de autenticacion del localstorage
    localStorage.clear()

    //Redirigir al login
    window.location.href = 'login.html'
}

//Funcion que obtiene personas del backend
async function cargarPersonas() {
    try{
        const response = await fetch(`${API_URL}/personas`) //Solicitud Get a la API
        personas = await response.json() //Almacena respuesta en arreglo
        await mostrarPersonas() //Muestra las personas en la tabla
    }catch(error){
        console.error('Error al cargar personas')
    }
}

//Funcion para mostrar todas las personas en la tabla
async function mostrarPersonas() {
    //Limpia el contenido actual del cuerpo de la tabla para evitar duplicados
    tablaPersonasBody.innerHTML = ''

    //Obtiene el elemento <template> que contiene la estructura de una fila de persona
    const template = document.getElementById('template')

    //Recorre la lista de personas obtenidas desde el backend
    for(const persona of personas){
        //Clona el contenido del template (fila predefinida)
        const clone = template.content.cloneNode(true)


        //Obtiene todas las celdas <td> dentro del clon
        const tds = clone.querySelectorAll('td')

        //Inicializa el contenido de imagen como 'Sin imagen' por defecto
        let imagenHTML = 'Sin imagen'

        //Intenta obtener la imagen de la persona desde el backend
        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`)

            //Convierte la respuesta en un objeto JSON
            const data = await response.json()

            //Si hay una imagen en la respuesta, se contruye la etiqueta <img> con la imagen en base64
            if(data.imagen){
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style="max-width: 100px; max-height: 100px">`

            }
        }catch(error){
            //SI ocurre un error al obtener la imagen, lo muestra en consola
            console.error('Error al cargar imagen: ', error)
        }

        //Llena las celdas con los datos de la persona
        tds[0].textContent = persona.id_persona //ID
        tds[1].textContent = persona.nombre //Nombre
        tds[2].textContent = persona.apellido //Apellido
        tds[3].textContent = persona.emai //emai
        tds[4].innerHTML = imagenHTML //Imagen (Si existe, muestra la imagen, si no, "Sin Imagen")

        //Busca los botones de editar y eliminar dentro del clon
        const btnEditar = clone.querySelector('.btn-editar')
        const btnEliminar = clone.querySelector('.btn-eliminar')

        //Asigna el evento de clic al boton de editar, llamando a la funcion con el ID de la persona
        btnEditar.addEventListener('click', () => editarPersona(persona.id_persona))

        //Asigna el evento de clic al boton de eliminar, llamando a la funcion con el ID de la persona
        btnEliminar.addEventListener('click', () => eliminarPersona(persona.id_persona))

        //Finalmente, agrega la fila clonada (con datos y botones configurados) al cuerpo de a tabla
        tablaPersonasBody.appendChild(clone)
    }
}

//Funcion que maneja el envio del formulario (crear o editar persona)
async function manejarSubmit(e) {
    e.preventDefault() //Previene el comportamiento por defecto del formulario

    //Obtiene los datos del formulario
    const persona = {
        id_persona: document.getElementById('id_persona').value || null,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        tipo_identificacion: document.getElementById('tipo_identificacion').value,
        nuip: parseInt(document.getElementById('nuip').value),
        emai: document.getElementById('emai').value,
        clave: document.getElementById('clave').value,
        salario: parseFloat(document.getElementById('salario').value),
        activo: document.getElementById('activo').checked
    }

    try{
        if(persona.id_persona){
            //Si estamos editanto (id_persona existe)

            //Subir imagen si fue seleccionada
            if(imagenInput.files[0]){
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0])
                await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                    method: 'PUT',
                    headers: {'content-Type': 'application/json'},
                    body: JSON.stringify({ imagen: imagenBase64})
                })
            }
            //Actualizar los datos de la persona
            await actualizarPersona(persona)
        }else{
            //Si es nueva persona
            const nuevaPersona = await crearPersona(persona) //Crear persona
            if(imagenInput.files[0]){
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0])
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${nuevaPersona.id_persona}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({imagen: imagenBase64})
                })
            }
        }
        limpiarFormulario() //Limpia el formulario
        cargarPersonas() //Recarga la lista
    }catch(error){
        console.error('Error al guardar persona:', error)
        alert('Error al guardar los datos: ' + error.message)
    }
}

//Crea una persona nueva en la base de datos
async function crearPersona(persona) {
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    })
    return await response.json() //Devuelve el objeto persona nuevo con id
}

//Actualiza una persona existente
async function actualizarPersona(persona) {
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    })
    return await response.json()
}

//Elimina persona (y su imagen existente)
async function eliminarPersona(id) {
    if(confirm('¿Esta seguro de eliminar esta persona?')){
        try{
            await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`, {method: 'DELETE'}) //Elimina imagen
            await fetch(`${API_URL}/personas/${id}`, {method: 'DELETE'}) //Elimina persona
            cargarPersonas() //Recarga la lista
        }catch(error){
            console.error('Error al eliminar persona:', error)
            alert('Error al eliminar la persona: ' + error.message)
        }
    }
}

//Llena el formulario con los datos de una personaa para editar
async function editarPersona(id) {
    const persona = personas.find(p => p.id_persona === id)
    if(persona){
        document.getElementById('id_persona').value = persona.id_persona
        document.getElementById('nombre').value = persona.nombre
        document.getElementById('apellido').value = persona.apellido
        document.getElementById('tipo_identificacion').value = persona.tipo_identificacion
        document.getElementById('nuip').value = persona.nuip
        document.getElementById('emai').value = persona.emai
        document.getElementById('clave').value = '' //No se muestra la contraseña
        document.getElementById('salario').value = persona.salario
        document.getElementById('activo').checked = persona.activo

        //Cargar la imagen si existe
        try{
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${id}`)
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
    }
}

//Limpia todos los campos del formulario
function limpiarFormulario(){
    personaForm.reset()
    document.getElementById('id_persona').value = ''
    previewImagen.style.display = 'none'
    previewImagen.src = ''
}

//Muestra una previsualizacion de la imagen seleccionada
function manejarImagen(e){
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

//Convierte imagen a base64 para enviarla al backend
function convertirImagenABase64(file){
    return new Promise((resolve, reject) =>{
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () =>{
            const base64 = reader.result.split(',')[1] //Elimina el prefijo del data URI
            resolve(base64)
        }
        reader.onerror = error => reject(error)
    })
}