//API URL base
const API_URL = 'http://localhost:3000/api'

//Elementos del DOM
const logingForm = document.getElementById('loginForm')
const mensajeDiv = document.getElementById('mensaje')

//Event Listeners
document.addEventListener('DOMContentLoaded', () =>{
    logingForm.addEventListener('submit', manejarLogin)

    //Verificar si el usuario esta autenticado
    const usuarioId = localStorage.getItem('usuarioId')
    if(usuarioId){
        //Si ya esta autenticado, redirigir a la pagina principal
        window.location.href = 'index_template.html'
    }
})

//Funcion para menejar el inicio de sesion
async function manejarLogin(e) {
    e.preventDefault()

    //Obtener valores del formulario
    const email = document.getElementById('email').value
    const clave = document.getElementById('clave').value

    try{
        //Enviar solicitud de inicio de sesion
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, clave})
        })

        const resultado = await response.json()

        if(resultado.success){
            //Guardar informacion del usuario en localstorage
            localStorage.setItem('usuarioId', resultado.usuario.id_usuario)
            localStorage.setItem('usuarioNombre', resultado.usuario.nombre)
            localStorage.setItem('usuarioApellido', resultado.usuario.apellido)
            localStorage.setItem('usuarioEmail', resultado.usuario.email)
            localStorage.setItem('usuarioRol', resultado.usuario.rol)

            mostrarMensaje('Inicio de sesion exitoso. Redirigiendo', true)

            //Redirigir a la pagina principal
            setTimeout(() => {
                window.location.href = 'index._template.html'
            }, 1000)
        }else{
            mostrarMensaje(resultado.message, false)
        }
    }catch(error){
        console.error('Error al iniciar sesion: ', error)
        mostrarMensaje('Error al procesar el inicio de sesion. Intente nuevamente', false)
    }
}

//Funcion para mostrar mensajes
function mostrarMensaje(texto, esExito){
    mensajeDiv.textContent = texto
    mensajeDiv.style.display = 'block'

    if(esExito){
        mensajeDiv.style.backgroundColor = '#d4edda'
        mensajeDiv.style.color = '#155724'
    }else{
        mensajeDiv.style.background = '#f8d7da'
        mensajeDiv.style.color = '#721c24'
    }
}