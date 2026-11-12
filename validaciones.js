export function esEmailValido(email) {
  return email.includes("@") && email.includes(".")
}

export function validar(nombre, edad, email) {
  if (nombre.trim().length < 2) return "Error: nombre muy corto"
  if (edad < 0 || edad > 120 || isNaN(edad)) return "Error: edad no valida"
  if (!esEmailValido(email)) return "Error: email no valido"
  return null
}