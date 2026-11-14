export function esEmailValido(email) {
  // ahora sí exige texto@texto.texto
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validar(nombre, edad, email) {
  if (nombre.trim().length < 2) return "Error: nombre muy corto (mín 2 letras)"
  if (!nombre.trim()) return "Error: nombre vacío"
  if (isNaN(edad) || edad === "") return "Error: poné una edad"
  if (edad < 1 || edad > 120) return "Error: edad entre 1 y 120"
  if (!esEmailValido(email.trim())) return "Error: email no válido, ej: hola@mail.com"
  return null
}