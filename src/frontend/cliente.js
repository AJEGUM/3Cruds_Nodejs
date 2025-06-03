document.addEventListener('DOMContentLoaded', () =>{
    const infoUsuario = document.createElement('div')
        infoUsuario.innerHTML = `
            <p>Bienvenido
                <a href="#" id="btnCerrarSesion">Cerrar sesion</a>
            </p>
        `
    document.body.insertBefore(infoUsuario, document.body.firstChild)
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion)
})

function cerrarSesion(e){
    e.preventDefault()

    //Limpiar datos de autenticacion del localstorage
    localStorage.clear()

    //Redirigir al login
    window.location.href = 'login.html'
}