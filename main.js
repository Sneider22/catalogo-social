// ================== DATOS BASE ==================
const animes = []; // Ya no hay animes de ejemplo

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

// ================== GÉNEROS DE TMDB ==================
let generosTMDB = {};
const TMDB_API_KEY = "e7fc358f1fb84ae5a56fda2f30e11a30"; // Tu API Key

function cargarGenerosTMDB() {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-ES`)
    .then(res => res.json())
    .then(data => {
      if (data.genres) {
        data.genres.forEach(g => {
          generosTMDB[g.id] = g.name;
        });
      }
    });
}
cargarGenerosTMDB();

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
      let poster = serie.tmdb && serie.tmdb.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w200${serie.tmdb.poster_path}" alt="${serie.titulo}" style="width:90px;border-radius:8px;float:left;margin-right:10px;">`
        : "";
      let year = serie.tmdb && serie.tmdb.first_air_date
        ? ` (${serie.tmdb.first_air_date.slice(0,4)})`
        : "";
      let overview = serie.tmdb && serie.tmdb.overview
        ? `<p style="font-size:0.95em;color:#6d28d9;margin-top:0.5em;">${serie.tmdb.overview.length > 180 ? serie.tmdb.overview.slice(0,180) + "..." : serie.tmdb.overview}</p>`
        : "";
      let generos = "";
      if (serie.tmdb && serie.tmdb.genre_ids && serie.tmdb.genre_ids.length) {
        generos = serie.tmdb.genre_ids.map(id => {
          const nombre = generosTMDB[id] || "Otro";
          const clase = "genero-badge genero-" + nombre.replace(/ /g, "\\ ");
          return `<span class="${clase}">${nombre}</span>`;
        }).join('');
      }
      let actoresAuto = serie.tmdb && serie.tmdb.actores && serie.tmdb.actores.length
        ? `<p><b>Actores:</b> ${serie.tmdb.actores.join(", ")}</p>`
        : "";
      card.innerHTML = `
        ${poster}
        <h3>${serie.titulo || (serie.tmdb && serie.tmdb.name) || ""}${year}</h3>
        ${generos ? `<div style="margin-bottom:0.3em;">${generos}</div>` : ""}
        ${actoresAuto}
        ${overview}
        <div style="clear:both"></div>
      `;
      document.querySelector('.serie-list').appendChild(card);
    });
  }
  if (seccion === "peliculas") {
    userList.filter(item => item.tipo === "pelicula").forEach(pelicula => {
      const card = document.createElement('div');
      card.className = `pelicula-card ${pelicula.estado || ""}`;
      let poster = pelicula.tmdb && pelicula.tmdb.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w200${pelicula.tmdb.poster_path}" alt="${pelicula.titulo}" style="width:90px;border-radius:8px;float:left;margin-right:10px;">`
        : "";
      let year = pelicula.tmdb && pelicula.tmdb.release_date
        ? ` (${pelicula.tmdb.release_date.slice(0,4)})`
        : "";
      let overview = pelicula.tmdb && pelicula.tmdb.overview
        ? `<p style="font-size:0.95em;color:#6d28d9;margin-top:0.5em;">${pelicula.tmdb.overview.length > 180 ? pelicula.tmdb.overview.slice(0,180) + "..." : pelicula.tmdb.overview}</p>`
        : "";
      let generos = "";
      if (pelicula.tmdb && pelicula.tmdb.genre_ids && pelicula.tmdb.genre_ids.length) {
        generos = pelicula.tmdb.genre_ids.map(id => {
          const nombre = generosTMDB[id] || "Otro";
          const clase = "genero-badge genero-" + nombre.replace(/ /g, "\\ ");
          return `<span class="${clase}">${nombre}</span>`;
        }).join('');
      }
      let actoresAuto = pelicula.tmdb && pelicula.tmdb.actores && pelicula.tmdb.actores.length
        ? `<p><b>Actores:</b> ${pelicula.tmdb.actores.join(", ")}</p>`
        : "";
      card.innerHTML = `
        ${poster}
        <h3>${pelicula.titulo}${year}</h3>
        ${generos ? `<div style="margin-bottom:0.3em;">${generos}</div>` : ""}
        ${actoresAuto}
        ${overview}
        <div style="clear:both"></div>
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
      let portada = libro.ol && libro.ol.cover
        ? `<img src="${libro.ol.cover}" alt="${libro.titulo}" style="width:70px;border-radius:8px;float:left;margin-right:10px;">`
        : "";
      let autor = libro.ol && libro.ol.author
        ? `<p><b>Autor:</b> ${libro.ol.author}</p>`
        : "";
      let year = libro.ol && libro.ol.year
        ? ` (${libro.ol.year})`
        : "";
      card.innerHTML = `
        ${portada}
        <h3>${libro.titulo}${year}</h3>
        ${autor}
        <div style="clear:both"></div>
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
    // Solo muestra el input de actores para películas y series
    if (["pelicula", "serie"].includes(tipoItem.value)) {
      const actoresInput = document.createElement('input');
      actoresInput.type = "text";
      actoresInput.placeholder = "Actores favoritos (opcional)";
      actoresInput.id = "extra-actores";
      extrasContainer.appendChild(actoresInput);
    }
  };

  // TMDB Autocompletado para películas
  const tituloInput = document.getElementById('titulo-item');
  const datalistPeliculas = document.getElementById('tmdb-peliculas-list');
  const datalistLibros = document.getElementById('libros-list');
  const datalistSeries = document.getElementById('tmdb-series-list');
  let ultimaPeliculaTMDB = null;
  let ultimoLibroOL = null;
  let actoresTMDB = [];
  let ultimaSerieTMDB = null;
  let actoresSerieTMDB = [];

  // Cambia el datalist según el tipo seleccionado
  tipoItem.addEventListener('change', () => {
    if (tipoItem.value === "serie") {
      tituloInput.setAttribute('list', 'tmdb-series-list');
    } else if (tipoItem.value === "pelicula") {
      tituloInput.setAttribute('list', 'tmdb-peliculas-list');
    } else if (tipoItem.value === "libro") {
      tituloInput.setAttribute('list', 'libros-list');
    } else {
      tituloInput.removeAttribute('list');
      datalistSeries.innerHTML = '';
      datalistPeliculas.innerHTML = '';
      datalistLibros.innerHTML = '';
    }
  });

  // Autocompletado de libros con Open Library
  tituloInput.addEventListener('input', function() {
    if (tipoItem.value !== "libro") return;
    const query = this.value.trim();
    if (query.length < 2) {
      datalistLibros.innerHTML = '';
      ultimoLibroOL = null;
      return;
    }
    fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`)
      .then(res => res.json())
      .then(data => {
        if (!data.docs) return;
        datalistLibros.innerHTML = data.docs
          .slice(0, 10)
          .map(b => `<option value="${b.title}${b.author_name ? ' - ' + b.author_name[0] : ''}">`)
          .join('');
        tituloInput.dataset.olResults = JSON.stringify(data.docs.slice(0, 10));
      });
  });

  // Autocompletado de series con TMDB
  tituloInput.addEventListener('input', function() {
    if (tipoItem.value !== "serie") return;
    const query = this.value.trim();
    if (query.length < 2) {
      datalistSeries.innerHTML = '';
      ultimaSerieTMDB = null;
      return;
    }
    fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.results) return;
        datalistSeries.innerHTML = data.results
          .slice(0, 10)
          .map(s => `<option value="${s.name}">`)
          .join('');
        tituloInput.dataset.tmdbSeriesResults = JSON.stringify(data.results.slice(0, 10));
      });
  });

  // Cuando el usuario sale del input, busca el objeto seleccionado y obtiene actores
  tituloInput.addEventListener('change', function() {
    if (tipoItem.value !== "pelicula") return;
    const results = JSON.parse(tituloInput.dataset.tmdbResults || "[]");
    const peli = results.find(p => p.title === tituloInput.value);
    ultimaPeliculaTMDB = peli || null;
    actoresTMDB = [];
    if (peli) {
      fetch(`https://api.themoviedb.org/3/movie/${peli.id}/credits?api_key=${TMDB_API_KEY}&language=es-ES`)
        .then(res => res.json())
        .then(data => {
          if (data.cast) {
            actoresTMDB = data.cast.slice(0, 3).map(a => a.name);
          }
        });
    }
  });

  // Cuando el usuario selecciona una serie, guarda el objeto y busca actores
  tituloInput.addEventListener('change', function() {
    if (tipoItem.value !== "serie") return;
    const results = JSON.parse(tituloInput.dataset.tmdbSeriesResults || "[]");
    const serie = results.find(s => s.name === tituloInput.value);
    ultimaSerieTMDB = serie || null;
    actoresSerieTMDB = [];
    if (serie) {
      fetch(`https://api.themoviedb.org/3/tv/${serie.id}/credits?api_key=${TMDB_API_KEY}&language=es-ES`)
        .then(res => res.json())
        .then(data => {
          if (data.cast) {
            actoresSerieTMDB = data.cast.slice(0, 3).map(a => a.name);
          }
        });
    }
  });

  // Guarda el libro seleccionado
  tituloInput.addEventListener('change', function() {
    if (tipoItem.value !== "libro") return;
    const results = JSON.parse(tituloInput.dataset.olResults || "[]");
    const libro = results.find(b => this.value.startsWith(b.title));
    ultimoLibroOL = libro || null;
  });

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
    // Si es película y hay datos TMDB, guarda info extra y actores
    if (tipo === "pelicula" && ultimaPeliculaTMDB) {
      nuevo.tmdb = {
        id: ultimaPeliculaTMDB.id,
        title: ultimaPeliculaTMDB.title,
        original_title: ultimaPeliculaTMDB.original_title,
        release_date: ultimaPeliculaTMDB.release_date,
        overview: ultimaPeliculaTMDB.overview,
        poster_path: ultimaPeliculaTMDB.poster_path,
        genre_ids: ultimaPeliculaTMDB.genre_ids,
        actores: actoresTMDB
      };
    }
    // Si es libro y hay datos de Open Library, guarda info extra
    if (tipo === "libro" && ultimoLibroOL) {
      nuevo.ol = {
        title: ultimoLibroOL.title,
        author: ultimoLibroOL.author_name ? ultimoLibroOL.author_name[0] : "",
        year: ultimoLibroOL.first_publish_year,
        cover: ultimoLibroOL.cover_i
          ? `https://covers.openlibrary.org/b/id/${ultimoLibroOL.cover_i}-M.jpg`
          : ""
      };
    }
    // Si es serie y hay datos TMDB, guarda info extra y actores
    if (tipo === "serie" && ultimaSerieTMDB) {
      nuevo.tmdb = {
        id: ultimaSerieTMDB.id,
        name: ultimaSerieTMDB.name,
        original_name: ultimaSerieTMDB.original_name,
        first_air_date: ultimaSerieTMDB.first_air_date,
        overview: ultimaSerieTMDB.overview,
        poster_path: ultimaSerieTMDB.poster_path,
        genre_ids: ultimaSerieTMDB.genre_ids,
        actores: actoresSerieTMDB
      };
    }
    const user = usuarioActual();
    let listas = JSON.parse(localStorage.getItem('listas') || '{}');
    if (!listas[user]) listas[user] = [];
    listas[user].push(nuevo);
    localStorage.setItem('listas', JSON.stringify(listas));
    addModal.classList.remove('active');
    renderSeccion(getSeccionActiva(), usuarioPerfilActual);
    ultimaPeliculaTMDB = null; // Limpia para el siguiente uso
    actoresTMDB = [];
  };
});