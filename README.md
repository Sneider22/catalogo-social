# 🎬📚 mi_lista

## ❓ ¿Qué es?

**mi_lista** es una aplicación web donde puedes crear, organizar y compartir tus listas personales de series/animes, películas y libros. Cada usuario puede tener su propio catálogo, ver el de otros usuarios y comparar gustos.

## ⚙️ ¿Cómo funciona?

- Regístrate e inicia sesión con tu usuario.
- Agrega series, películas o libros a tu lista personal.
- El sistema te ayuda con autocompletado usando datos de TMDB (pelis/series) y OpenLibrary (libros).
- Puedes ver y comparar listas de otros usuarios.
- Cambia tu avatar y elimina elementos de tu lista cuando quieras.

## 🗂️ Estructura del proyecto

```
mi_lista/
│
├── index.html      # Página principal de la aplicación web
├── estilos.css     # Estilos visuales (colores, tarjetas, responsive, etc.)
├── main.js         # Lógica principal: login, gestión de listas, autocompletado, perfiles, etc.
└── README.md       # Documentación del proyecto
```

## 🚀 ¿Cómo usarlo?

1. Abre `index.html` en tu navegador.
2. Regístrate con un usuario y contraseña.
3. Inicia sesión.
4. Usa el botón "+" para agregar series, películas o libros.
5. Busca títulos y selecciona de las sugerencias automáticas.
6. Navega entre tus listas usando el menú superior.
7. Puedes ver y comparar listas de otros usuarios desde el perfil.
8. Cambia tu avatar desde tu perfil si lo deseas.

## 📝 Notas

- Todos los datos se guardan en tu navegador (localStorage), no hay base de datos externa.
- El autocompletado usa las APIs públicas de TMDB y OpenLibrary.
- Para eliminar un elemento, haz clic en el ícono de basura en la tarjeta.
- El proyecto es responsive y funciona en móvil y escritorio.
- Si tienes problemas con la API de TMDB, revisa tu conexión o la clave en `main.js`.

---

¡Disfruta organizando tus gustos con **mi_lista**!