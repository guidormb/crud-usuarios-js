const KEY_USERS = "auth_users"
const KEY_SESSION = "auth_session"

function getUsers(){ return JSON.parse(localStorage.getItem(KEY_USERS) || "[]") }
function saveUsers(u){ localStorage.setItem(KEY_USERS, JSON.stringify(u)) }

// Si ya está logueado y entra al login, mandalo al CRUD
if(localStorage.getItem(KEY_SESSION) && location.pathname.includes("login")){
  location.replace("index.html")
}

document.getElementById("formLogin")?.addEventListener("submit", e => {
  e.preventDefault()
  const user = document.getElementById("loginUser").value.trim()
  const pass = document.getElementById("loginPass").value
  const users = getUsers()
  const found = users.find(u => u.user === user && u.pass === btoa(pass))
  if(found){
    localStorage.setItem(KEY_SESSION, user)
    location.replace("index.html")
  } else {
    document.getElementById("msg").textContent = "❌ Usuario o contraseña incorrectos"
  }
})

document.getElementById("formRegistro")?.addEventListener("submit", e => {
  e.preventDefault()
  const user = document.getElementById("regUser").value.trim()
  const pass = document.getElementById("regPass").value
  if(user.length < 3) return alert("Usuario mínimo 3 letras")
  if(pass.length < 4) return alert("Contraseña mínimo 4 caracteres")
  let users = getUsers()
  if(users.find(u => u.user === user)) return alert("Ese usuario ya existe")
  users.push({ user, pass: btoa(pass) })
  saveUsers(users)
  alert("✅ Cuenta creada! Ahora logueate")
  document.getElementById("formRegistro").style.display="none"
  document.getElementById("formLogin").style.display="flex"
})

document.getElementById("linkRegistro")?.addEventListener("click", e => {
  e.preventDefault()
  document.getElementById("formLogin").style.display="none"
  document.getElementById("formRegistro").style.display="flex"
})
document.getElementById("btnVolver")?.addEventListener("click", () => {
  document.getElementById("formRegistro").style.display="none"
  document.getElementById("formLogin").style.display="flex"
})