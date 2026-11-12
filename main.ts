interface Usuario {
  id: number;
  nombre: string;
  edad: number;
  email: string;
}

let usuarios: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]")
let siguienteId: number = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1
let editandoId: number | null = null

function guardar() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios))
}

function mostrarUsuarios() {
  let lista = document.getElementById("lista") as HTMLUListElement
  lista.innerHTML = ""
  usuarios.forEach(u => {
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

function agregarOEditar() {
  let nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim()
  let edad = parseInt((document.getElementById("edad") as HTMLInputElement).value)
  let email = (document.getElementById("email") as HTMLInputElement).value.trim()
  if (!nombre || !edad || !email) return alert("Completa todo")

  if (editandoId !== null) {
    let u = usuarios.find(x => x.id === editandoId)
    if (u) { u.nombre = nombre; u.edad = edad; u.email = email }
    editandoId = null
    ;(document.getElementById("btnAgregar") as HTMLButtonElement).innerText = "Agregar"
  } else {
    usuarios.push({ id: siguienteId++, nombre, edad, email })
  }

  guardar(); mostrarUsuarios()
  ;(document.getElementById("nombre") as HTMLInputElement).value = ""
  ;(document.getElementById("edad") as HTMLInputElement).value = ""
  ;(document.getElementById("email") as HTMLInputElement).value = ""
}

function eliminarUsuario(id: number) {
  usuarios = usuarios.filter(u => u.id !== id)
  guardar(); mostrarUsuarios()
}

function iniciarEdicion(id: number) {
  let u = usuarios.find(x => x.id === id)
  if (!u) return
  ;(document.getElementById("nombre") as HTMLInputElement).value = u.nombre
  ;(document.getElementById("edad") as HTMLInputElement).value = String(u.edad)
  ;(document.getElementById("email") as HTMLInputElement).value = u.email
  editandoId = id
  ;(document.getElementById("btnAgregar") as HTMLButtonElement).innerText = "Guardar"
}

function exportarJSON() {
  let blob = new Blob([JSON.stringify(usuarios, null, 2)], { type: "application/json" })
  let url = URL.createObjectURL(blob)
  let a = document.createElement("a")
  a.href = url; a.download = "usuarios.json"; a.click()
}

function importarJSON(event: any) {
  let archivo = event.target.files[0]
  if (!archivo) return
  let lector = new FileReader()
  lector.onload = (e: any) => {
    try {
      let datos: Usuario[] = JSON.parse(e.target.result)
      usuarios = datos // REEMPLAZA, no suma
      siguienteId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1
      guardar(); mostrarUsuarios()
      alert("Importado: " + usuarios.length + " usuarios")
    } catch { alert("JSON inválido") }
  }
  lector.readAsText(archivo)
}

mostrarUsuarios()