// ================== DATOS BASE ==================
const animes = [
  { titulo: "Los caballeros del Zodiaco", anio: 1986, caps: "145 capítulos", estado: "visto" },
  { titulo: "Dragon Ball Z", anio: 1989, caps: "261 capítulos", estado: "visto" },
  { titulo: "Dragon Ball GT", anio: 1996, caps: "64 capítulos", estado: "visto" },
  { titulo: "Neon Genesis Evangelion", anio: 1995, caps: "26 capítulos / 2 películas", estado: "visto" },
  { titulo: "Cowboy Bebop", anio: 1998, caps: "26 capítulos", estado: "visto" },
  { titulo: "Naruto", anio: 2002, caps: "220 capítulos", estado: "visto" },
  { titulo: "Samurai Champloo", anio: 2004, caps: "26 capítulos", estado: "visto" },
  { titulo: "Monster", anio: 2004, caps: "74 capítulos", estado: "visto" },
  { titulo: "Bleach", anio: 2004, caps: "133 capítulos / ...", estado: "viendo" },
  { titulo: "Avatar: La leyenda de Aang", anio: 2005, caps: "61 capítulos", estado: "visto" },
  { titulo: "The Office", anio: 2005, caps: "201 capítulos", estado: "visto" },
  { titulo: "Steins; Gate", anio: 2011, caps: "26 capítulos", estado: "visto" },
  { titulo: "Avatar: La leyenda de Korra", anio: 2012, caps: "52 capítulos", estado: "visto" },
  { titulo: "Terror in Resonance", anio: 2014, caps: "1/11 capítulos ...", estado: "viendo" },
  { titulo: "Orange", anio: 2016, caps: "13 capítulos", estado: "visto" },
  { titulo: "Steins; Gate 0", anio: 2018, caps: "23 capítulos", estado: "visto" },
  { titulo: "Devilman Crybaby", anio: 2018, caps: "10 capítulos", estado: "visto" },
  { titulo: "Dr. Stone", anio: 2019, caps: "57 capítulos / ...", estado: "viendo" }
];

// ================== UTILIDADES LOGIN ==================
function mostrarLogin(mostrar) {
  document.getElementById('login-modal').style.display = mostrar ? 'flex' : 'none';
  const main = document.getElementById('main-content');
  if (main) main.style.filter = mostrar ? 'blur(2px)' : 'none';
}

function usuarioActual() {
  return localStorage.getItem('usuario_activo');
}

function guardarUsuario(usuario, password) {
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
  usuarios[usuario] = password;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function validarUsuario(usuario, password) {
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
  return usuarios[usuario] === password;
}

function existeUsuario(usuario) {
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
  return !!usuarios[usuario];
}

function cerrarSesion() {
  localStorage.removeItem('usuario_activo');
  location.reload();
}

// ================== PERFIL Y COMPARACIÓN ==================
const perfilUsuario = document.getElementById('perfil-usuario');
const usuarioSelector = document.getElementById('usuario-selector');
const coincidenciaGustos = document.getElementById('coincidencia-gustos');
const verMiPerfilBtn = document.getElementById('ver-mi-perfil');
let usuarioPerfilActual = usuarioActual();

function cargarUsuariosSelector() {
  let usuarios = Object.keys(JSON.parse(localStorage.getItem('usuarios') || '{}'));
  usuarioSelector.innerHTML = '';
  usuarios.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u;
    usuarioSelector.appendChild(opt);
  });
  usuarioSelector.value = usuarioPerfilActual;
}

function mostrarPerfil(usuario) {
  usuarioPerfilActual = usuario;
  perfilUsuario.textContent = usuario;
  cargarUsuariosSelector();
  verMiPerfilBtn.style.display = usuario !== usuarioActual() ? 'inline-block' : 'none';
  renderSeccion(getSeccionActiva(), usuario);
  if (usuario !== usuarioActual()) {
    coincidenciaGustos.textContent = `Coincidencia: ${calcularCoincidencia(usuarioActual(), usuario)}%`;
  } else {
    coincidenciaGustos.textContent = '';
  }
}

function calcularCoincidencia(userA, userB) {
  let listas = JSON.parse(localStorage.getItem('listas') || '{}');
  let listaA = (listas[userA] || []).map(item => item.titulo.toLowerCase());
  let listaB = (listas[userB] || []).map(item => item.titulo.toLowerCase());
  if (listaA.length === 0 || listaB.length === 0) return 0;
  let comunes = listaA.filter(titulo => listaB.includes(titulo));
  let total = Math.max(listaA.length, listaB.length);
  return Math.round((comunes.length / total) * 100);
}

// ================== AGREGAR ELEMENTOS ==================
const addBtn = document.getElementById('add-item-btn');
const addModal = document.getElementById('add-modal');
const addForm = document.getElementById('add-form');
const tipoItem = document.getElementById('tipo-item');
const extrasContainer = document.getElementById('extras-container');
const cancelAdd = document.getElementById('cancel-add');

function getSeccionActiva() {
  const activo = document.querySelector('nav li.activo');
  return activo ? activo.dataset.section : "animes";
}

// ================== RENDERIZADO DE SECCIONES ==================
function renderSeccion(seccion, usuario = usuarioPerfilActual) {
  const user = usuario;
  let listas = JSON.parse(localStorage.getItem('listas') || '{}');
  let userList = listas[user] || [];
  document.querySelector('.anime-list').innerHTML = '';
  document.querySelector('.serie-list').innerHTML = '';
  document.querySelector('.pelicula-list').innerHTML = '';
  document.querySelector('.manga-list').innerHTML = '';
  document.querySelector('.libro-list').innerHTML = '';

  if (seccion === "animes") {
    let listaFinal = [...animes];
    if (user !== "admin") {
      listaFinal = listaFinal.concat(userList.filter(item => item.tipo === "anime"));
    }
    listaFinal.forEach(anime => {
      const card = document.createElement('div');
      card.className = `anime-card ${anime.estado || ""}`;
      card.innerHTML = `
        <h3>${anime.titulo} ${anime.anio ? `<span>(${anime.anio})</span>` : ""}</h3>
        <p>${anime.caps || ""}</p>
        ${anime.actores ? `<p><b>Actores:</b> ${anime.actores}</p>` : ""}
        ${anime.autor ? `<p><b>Autor:</b> ${anime.autor}</p>` : ""}
      `;
      document.querySelector('.anime-list').appendChild(card);
    });
  }
  if (seccion === "series") {
    userList.filter(item => item.tipo === "serie").forEach(serie => {
      const card = document.createElement('div');
      card.className = `serie-card ${serie.estado || ""}`;
      card.innerHTML = `
        <h3>${serie.titulo}</h3>
        <p>${serie.caps || ""}</p>
        ${serie.actores ? `<p><b>Actores:</b> ${serie.actores}</p>` : ""}
      `;
      document.querySelector('.serie-list').appendChild(card);
    });
  }
  if (seccion === "peliculas") {
    userList.filter(item => item.tipo === "pelicula").forEach(pelicula => {
      const card = document.createElement('div');
      card.className = `pelicula-card ${pelicula.estado || ""}`;
      card.innerHTML = `
        <h3>${pelicula.titulo}</h3>
        ${pelicula.actores ? `<p><b>Actores:</b> ${pelicula.actores}</p>` : ""}
      `;
      document.querySelector('.pelicula-list').appendChild(card);
    });
  }
  if (seccion === "mangas") {
    userList.filter(item => item.tipo === "manga").forEach(manga => {
      const card = document.createElement('div');
      card.className = `manga-card ${manga.estado || ""}`;
      card.innerHTML = `
        <h3>${manga.titulo}</h3>
        <p>${manga.caps || ""}</p>
        ${manga.autor ? `<p><b>Autor:</b> ${manga.autor}</p>` : ""}
      `;
      document.querySelector('.manga-list').appendChild(card);
    });
  }
  if (seccion === "libros") {
    userList.filter(item => item.tipo === "libro").forEach(libro => {
      const card = document.createElement('div');
      card.className = `libro-card ${libro.estado || ""}`;
      card.innerHTML = `
        <h3>${libro.titulo}</h3>
        ${libro.autor ? `<p><b>Autor:</b> ${libro.autor}</p>` : ""}
        ${libro.caps ? `<p><b>Capítulos:</b> ${libro.caps}</p>` : ""}
      `;
      document.querySelector('.libro-list').appendChild(card);
    });
  }
}

// ================== EVENTOS PRINCIPALES ==================
document.addEventListener('DOMContentLoaded', () => {
  // LOGIN
  if (!usuarioActual()) {
    mostrarLogin(true);
  } else {
    mostrarLogin(false);
    // Mostrar usuario en header
    const header = document.querySelector('header');
    if (!document.getElementById('logout-btn')) {
      const userDiv = document.createElement('div');
      userDiv.style.float = 'right';
      userDiv.style.marginRight = '1rem';
      userDiv.innerHTML = `<span style="color:#a78bfa;font-weight:bold;">${usuarioActual()}</span> <button id="logout-btn" style="margin-left:10px;background:#be185d;color:#fff;border:none;border-radius:5px;padding:3px 10px;cursor:pointer;">Salir</button>`;
      header.appendChild(userDiv);
      document.getElementById('logout-btn').onclick = cerrarSesion;
    }
  }

  // Login y registro
  document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const password = document.getElementById('login-password').value;
    if (validarUsuario(usuario, password)) {
      localStorage.setItem('usuario_activo', usuario);
      mostrarLogin(false);
      location.reload();
    } else {
      document.getElementById('login-error').textContent = "Usuario o contraseña incorrectos";
    }
  };
  document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const usuario = document.getElementById('register-usuario').value.trim();
    const password = document.getElementById('register-password').value;
    if (usuario.length < 3 || password.length < 3) {
      document.getElementById('register-error').textContent = "Mínimo 3 caracteres";
      return;
    }
    if (existeUsuario(usuario)) {
      document.getElementById('register-error').textContent = "El usuario ya existe";
      return;
    }
    guardarUsuario(usuario, password);
    document.getElementById('register-error').textContent = "";
    alert("¡Usuario registrado! Ahora puedes iniciar sesión.");
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
  };
  document.getElementById('show-register').onclick = function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
  };
  document.getElementById('show-login').onclick = function(e) {
    e.preventDefault();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
  };

  // PERFIL
  mostrarPerfil(usuarioActual());

  // Navegación entre secciones
  const navItems = document.querySelectorAll('nav li');
  const secciones = document.querySelectorAll('.catalogo');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('activo'));
      item.classList.add('activo');
      secciones.forEach(sec => {
        if (sec.id === item.dataset.section) {
          sec.classList.add('activo');
        } else {
          sec.classList.remove('activo');
        }
      });
      renderSeccion(getSeccionActiva(), usuarioPerfilActual);
    });
  });

  // Selector de usuario en perfil
  usuarioSelector.addEventListener('change', () => {
    mostrarPerfil(usuarioSelector.value);
  });
  verMiPerfilBtn.addEventListener('click', () => {
    mostrarPerfil(usuarioActual());
  });

  // Botón flotante agregar
  addBtn.onclick = () => {
    addModal.classList.add('active');
    addForm.reset();
    extrasContainer.innerHTML = '';
    const seccion = getSeccionActiva();
    tipoItem.value = seccion === "peliculas" ? "pelicula" : seccion.slice(0, -1);
    tipoItem.dispatchEvent(new Event('change'));
  };
  cancelAdd.onclick = () => {
    addModal.classList.remove('active');
  };
  tipoItem.onchange = () => {
    extrasContainer.innerHTML = '';
    if (!tipoItem.value) return;
    const extraLabel = document.createElement('label');
    extraLabel.textContent = "¿Quieres agregar información extra?";
    extrasContainer.appendChild(extraLabel);
    if (["anime", "manga", "serie", "libro"].includes(tipoItem.value)) {
      const capsInput = document.createElement('input');
      capsInput.type = "number";
      capsInput.min = "1";
      capsInput.placeholder = "Cantidad de capítulos/episodios";
      capsInput.id = "extra-caps";
      extrasContainer.appendChild(capsInput);
    }
    if (["pelicula", "serie"].includes(tipoItem.value)) {
      const actoresInput = document.createElement('input');
      actoresInput.type = "text";
      actoresInput.placeholder = "Actores favoritos (opcional)";
      actoresInput.id = "extra-actores";
      extrasContainer.appendChild(actoresInput);
    }
    if (tipoItem.value === "libro") {
      const autorInput = document.createElement('input');
      autorInput.type = "text";
      autorInput.placeholder = "Autor (opcional)";
      autorInput.id = "extra-autor";
      extrasContainer.appendChild(autorInput);
    }
  };
  addForm.onsubmit = function(e) {
    e.preventDefault();
    const tipo = tipoItem.value;
    const titulo = document.getElementById('titulo-item').value.trim();
    if (!tipo || !titulo) return;
    let nuevo = { titulo, tipo, estado: "visto" };
    if (document.getElementById('extra-caps')) {
      nuevo.caps = document.getElementById('extra-caps').value
        ? document.getElementById('extra-caps').value + " capítulos"
        : undefined;
    }
    if (document.getElementById('extra-actores')) {
      nuevo.actores = document.getElementById('extra-actores').value;
    }
    if (document.getElementById('extra-autor')) {
      nuevo.autor = document.getElementById('extra-autor').value;
    }
    const user = usuarioActual();
    let listas = JSON.parse(localStorage.getItem('listas') || '{}');
    if (!listas[user]) listas[user] = [];
    listas[user].push(nuevo);
    localStorage.setItem('listas', JSON.stringify(listas));
    addModal.classList.remove('active');
    renderSeccion(getSeccionActiva(), usuarioPerfilActual);
  };
});