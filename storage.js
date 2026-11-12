export function guardar(usuarios, proximoId) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios))
  localStorage.setItem("proximoId", proximoId.toString())
}

export function cargar() {
  let datos = localStorage.getItem("usuarios")
  let id = localStorage.getItem("proximoId")
  return {
    usuarios: datos ? JSON.parse(datos) : null,
    proximoId: id ? parseInt(id) : null
  }
}