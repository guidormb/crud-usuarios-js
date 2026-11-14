// Protección de sesión
if (!localStorage.getItem("auth_session")) {
  location.href = "login.html"
}
const sesionUser = localStorage.getItem("auth_session")
document.addEventListener("DOMContentLoaded", () => {
  const span = document.getElementById("userHola")
  if (span) span.textContent = `Hola, ${sesionUser} 👋`
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("auth_session")
    location.href = "login.html"
  })
})
if(!localStorage.getItem("auth_session")) location.href="login.html"
import { guardar, cargar } from "./storage.js"
import { validar } from "./validaciones.js"

let usuarios = [{ id: 1, nombre: "Guido", edad: 29, email: "guido@mail.com" }]
let proximoId = 2
let idEnEdicion = null

const inputBuscar = document.getElementById("inputBuscar")
const contador = document.getElementById("contador")
const selectOrden = document.getElementById("selectOrden")
const btnTema = document.getElementById("btnTema")
const lista = document.getElementById("lista")
const formUsuario = document.getElementById("formUsuario")

// --- TEMA ---
let tema = localStorage.getItem("tema") || "light"
document.documentElement.setAttribute("data-theme", tema)
if (btnTema) btnTema.textContent = tema === "dark" ? "☀️" : "🌙"
if (btnTema) {
  btnTema.addEventListener("click", () => {
    tema = tema === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", tema)
    localStorage.setItem("tema", tema)
    btnTema.textContent = tema === "dark" ? "☀️" : "🌙"
  })
}

// --- STORAGE ---
let datos = cargar()
if (datos.usuarios) usuarios = datos.usuarios
if (datos.proximoId) proximoId = datos.proximoId

// --- OPTIMIZACIÓN: Debounce ---
function debounce(fn, ms = 250) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

// --- RENDER OPTIMIZADO con Fragment ---
function mostrarUsuarios(listaAMostrar = usuarios) {
  lista.innerHTML = ""
  
  let promedio = 0
  if (usuarios.length > 0) {
    const suma = usuarios.reduce((acc, u) => acc + u.edad, 0)
    promedio = (suma / usuarios.length).toFixed(1)
  }
  
  if (listaAMostrar.length === 0) {
    contador.textContent = usuarios.length === 0 ? "No hay usuarios" : "Sin resultados"
  } else {
    contador.textContent = `Mostrando ${listaAMostrar.length} de ${usuarios.length} | Prom: ${promedio} años`
  }

  const frag = document.createDocumentFragment()
  listaAMostrar.forEach(u => {
    const li = document.createElement("li")
    li.innerHTML = `
      <span class="info">${u.id} - ${u.nombre} (${u.edad}) - ${u.email}</span>
      <div class="acciones">
        <button onclick="iniciarEdicion(${u.id})">Editar</button>
        <button onclick="eliminarUsuario(${u.id})">X</button>
      </div>`
    frag.appendChild(li)
  })
  lista.appendChild(frag)
}

function obtenerListaProcesada() {
  const texto = inputBuscar.value.toLowerCase().trim()
  let result = texto === "" ? usuarios : usuarios.filter(u => u.nombre.toLowerCase().includes(texto) || u.email.toLowerCase().includes(texto))
  
  const orden = selectOrden.value
  return [...result].sort((a, b) => {
    if (orden === "nombre") return a.nombre.localeCompare(b.nombre)
    if (orden === "nombre_desc") return b.nombre.localeCompare(a.nombre)
    if (orden === "edad") return a.edad - b.edad
    if (orden === "edad_desc") return b.edad - a.edad
    return a.id - b.id
  })
}

function agregarUsuario(nombre, edad, email) {
  nombre = nombre.trim()
  email = email.trim().toLowerCase()
  const error = validar(nombre, edad, email)
  if (error) return error
  if (usuarios.find(u => u.email === email && u.id !== idEnEdicion)) return `Error: ${email} ya existe`
  
  if (idEnEdicion !== null) {
    const u = usuarios.find(x => x.id === idEnEdicion)
    u.nombre = nombre; u.edad = edad; u.email = email
    idEnEdicion = null
    document.getElementById("btnAgregar").textContent = "Agregar"
    guardar(usuarios, proximoId)
    return `Usuario ${nombre} editado!`
  } else {
    usuarios.push({ id: proximoId++, nombre, edad, email })
    guardar(usuarios, proximoId)
    return `Usuario ${nombre} agregado!`
  }
}

function eliminarUsuario(id) {
  if (!confirm(`Borrar usuario ${id}?`)) return
  usuarios = usuarios.filter(u => u.id !== id)
  guardar(usuarios, proximoId)
  mostrarUsuarios(obtenerListaProcesada())
}

function iniciarEdicion(id) {
  const u = usuarios.find(x => x.id === id)
  document.getElementById("nombre").value = u.nombre
  document.getElementById("edad").value = u.edad
  document.getElementById("email").value = u.email
  idEnEdicion = id
  document.getElementById("btnAgregar").textContent = "Guardar cambios"
}

window.eliminarUsuario = eliminarUsuario
window.iniciarEdicion = iniciarEdicion

// --- EVENTOS OPTIMIZADOS ---
formUsuario.addEventListener("submit", (e) => {
  e.preventDefault()
  const mensaje = agregarUsuario(
    document.getElementById("nombre").value,
    parseInt(document.getElementById("edad").value),
    document.getElementById("email").value
  )
  alert(mensaje)
  if (!mensaje.startsWith("Error")) formUsuario.reset()
  mostrarUsuarios(obtenerListaProcesada())
})

inputBuscar.addEventListener("input", debounce(() => mostrarUsuarios(obtenerListaProcesada()), 250))
selectOrden.addEventListener("change", () => mostrarUsuarios(obtenerListaProcesada()))

document.getElementById("btnExportar").addEventListener("click", async () => {
  const datos = JSON.stringify(usuarios, null, 2)
  try {
    const blob = new Blob([datos], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "usuarios.json"; a.click()
    URL.revokeObjectURL(url)
  } catch {}
  try {
    await navigator.clipboard.writeText(datos)
    alert("Exportado y copiado!")
  } catch { prompt("Copia:", datos) }
})

document.getElementById("inputImportar").addEventListener("change", (e) => {
  const archivo = e.target.files[0]
  if (!archivo) return
  const lector = new FileReader()
  lector.onload = (ev) => {
    try {
      usuarios = JSON.parse(ev.target.result)
      proximoId = Math.max(...usuarios.map(u => u.id), 0) + 1
      guardar(usuarios, proximoId)
      mostrarUsuarios(obtenerListaProcesada())
      alert(`Importado: ${usuarios.length}`)
    } catch { alert("Archivo no válido") }
  }
  lector.readAsText(archivo)
  e.target.value = ""
})

mostrarUsuarios(obtenerListaProcesada())