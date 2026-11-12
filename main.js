import { guardar, cargar } from "./storage.js"
import { validar } from "./validaciones.js"

let usuarios = [{ id: 1, nombre: "Guido", edad: 29, email: "guido@mail.com" }]
let proximoId = 2
let idEnEdicion = null

const inputBuscar = document.getElementById("inputBuscar")
const contador = document.getElementById("contador")
const selectOrden = document.getElementById("selectOrden")

let datos = cargar()
if (datos.usuarios) usuarios = datos.usuarios
if (datos.proximoId) proximoId = datos.proximoId

function mostrarUsuarios(listaAMostrar = usuarios) {
  let lista = document.getElementById("lista")
  lista.innerHTML = ""
  
  let promedio = 0
  if (usuarios.length > 0) {
    let suma = usuarios.reduce((acc, u) => acc + u.edad, 0)
    promedio = (suma / usuarios.length).toFixed(1)
  }
  
  if (listaAMostrar.length === 0) {
    contador.textContent = usuarios.length === 0 ? "No hay usuarios" : "Sin resultados"
  } else {
    contador.textContent = `Mostrando ${listaAMostrar.length} de ${usuarios.length} usuarios | Promedio: ${promedio} años`
  }
  listaAMostrar.forEach(u => {
    lista.innerHTML += `
      <li>
        <span class="info">${u.id} - ${u.nombre} (${u.edad}) - ${u.email}</span>
        <div class="acciones">
          <button onclick="iniciarEdicion(${u.id})">Editar</button>
          <button onclick="eliminarUsuario(${u.id})">X</button>
        </div>
      </li>`
  })
}


function obtenerListaProcesada() {
  let texto = inputBuscar.value.toLowerCase().trim()
  let lista = usuarios
  if (texto !== "") {
    lista = usuarios.filter(u => u.nombre.toLowerCase().includes(texto) || u.email.toLowerCase().includes(texto))
  }
  let orden = selectOrden.value
  lista = [...lista].sort((a, b) => {
    if (orden === "nombre") return a.nombre.localeCompare(b.nombre)
    if (orden === "nombre_desc") return b.nombre.localeCompare(a.nombre)
    if (orden === "edad") return a.edad - b.edad
    if (orden === "edad_desc") return b.edad - a.edad
    return a.id - b.id
  })
  return lista
}

function agregarUsuario(nombre, edad, email) {
  nombre = nombre.trim()
  email = email.trim().toLowerCase()
  let error = validar(nombre, edad, email)
  if (error) return error
  let existe = usuarios.find(u => u.email === email && u.id !== idEnEdicion)
  if (existe) return "Error: " + email + " ya existe"
  if (idEnEdicion !== null) {
    let u = usuarios.find(x => x.id === idEnEdicion)
    u.nombre = nombre; u.edad = edad; u.email = email
    idEnEdicion = null
    document.getElementById("btnAgregar").textContent = "Agregar"
    guardar(usuarios, proximoId)
    return "Usuario " + nombre + " editado!"
  } else {
    usuarios.push({ id: proximoId++, nombre, edad, email })
    guardar(usuarios, proximoId)
    return "Usuario " + nombre + " agregado!"
  }
}

function eliminarUsuario(id) {
  if (!confirm("Borrar usuario " + id + "?")) return
  usuarios = usuarios.filter(u => u.id !== id)
  guardar(usuarios, proximoId)
  mostrarUsuarios(obtenerListaProcesada())
}

function iniciarEdicion(id) {
  let u = usuarios.find(x => x.id === id)
  document.getElementById("nombre").value = u.nombre
  document.getElementById("edad").value = u.edad
  document.getElementById("email").value = u.email
  idEnEdicion = id
  document.getElementById("btnAgregar").textContent = "Guardar cambios"
}

window.eliminarUsuario = eliminarUsuario
window.iniciarEdicion = iniciarEdicion

document.getElementById("btnAgregar").addEventListener("click", () => {
  let mensaje = agregarUsuario(
    document.getElementById("nombre").value,
    parseInt(document.getElementById("edad").value),
    document.getElementById("email").value
  )
  alert(mensaje)
  if (!mensaje.startsWith("Error")) {
    document.getElementById("nombre").value = ""
    document.getElementById("edad").value = ""
    document.getElementById("email").value = ""
  }
  mostrarUsuarios(obtenerListaProcesada())
})

inputBuscar.addEventListener("input", () => {
  mostrarUsuarios(obtenerListaProcesada())
})

selectOrden.addEventListener("change", () => {
  mostrarUsuarios(obtenerListaProcesada())
})

document.getElementById("btnExportar").addEventListener("click", async () => {
  let datos = JSON.stringify(usuarios, null, 2)
  console.log("Exportando:", datos)
  
  // Intento 1: Descarga que funciona en navegador normal
  try {
    let blob = new Blob([datos], { type: "application/json" })
    let url = URL.createObjectURL(blob)
    let a = document.createElement("a")
    a.href = url
    a.download = "usuarios.json"
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.log("Fallo descarga", e)
  }
  
  // Intento 2: Copiado al portapapeles que funciona en Spck
  try {
    await navigator.clipboard.writeText(datos)
    alert("Listo! Si no descargó, ya está copiado al portapapeles. Pegalo en un .json")
  } catch {
    prompt("Copia este JSON:", datos)
  }
})

document.getElementById("inputImportar").addEventListener("change", (e) => {
  let archivo = e.target.files[0]
  if (!archivo) return
  let lector = new FileReader()
  lector.onload = (ev) => {
    try {
      usuarios = JSON.parse(ev.target.result)
      let maxId = 0
      usuarios.forEach(u => { if (u.id > maxId) maxId = u.id })
      proximoId = maxId + 1
      guardar(usuarios, proximoId)
      mostrarUsuarios(obtenerListaProcesada())
      alert("Importado: " + usuarios.length + " usuarios")
    } catch {
      alert("Archivo no valido")
    }
  }
  lector.readAsText(archivo)
  e.target.value = ""
})

mostrarUsuarios(obtenerListaProcesada())