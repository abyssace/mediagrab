# MediaGrab

MediaGrab es una web app personal mínima para descargar un enlace como MP4 o MP3. Usa Node.js, Express, `yt-dlp` y `ffmpeg`.

Úsala únicamente con contenido propio o para el que tengas permiso de descarga. No la expongas directamente a internet público sin añadir autenticación y otras medidas de seguridad.

## Instalación local

Requisitos: Node.js 18+, `yt-dlp` y `ffmpeg` instalados y disponibles en el PATH.

```bash
npm install
npm start
```

Abre `http://localhost:3000`. Si el binario no está en el PATH, indica su ubicación:

```bash
# Linux/macOS
YTDLP_PATH=/ruta/a/yt-dlp PORT=3000 npm start

# PowerShell
$env:YTDLP_PATH = "C:\\ruta\\yt-dlp.exe"; npm start
```

## Docker

```bash
docker build -t mediagrab .
docker run --rm -p 3000:3000 mediagrab
```

Después visita `http://localhost:3000`.

## Despliegue: Netlify + Railway

La aplicación se separa en dos servicios:

- **Netlify** sirve el frontend estático de `public/`.
- **Railway** ejecuta el backend usando el `Dockerfile`, incluyendo Node.js, yt-dlp y ffmpeg.

### Backend en Railway

1. Sube este proyecto a GitHub.
2. En Railway crea un proyecto nuevo desde ese repositorio.
3. Railway detectará `Dockerfile` y `railway.json` automáticamente.
4. En las variables del servicio configura:

   ```text
   YTDLP_PATH=/usr/local/bin/yt-dlp
   FRONTEND_ORIGIN=https://TU-SITIO.netlify.app
   ```

   Railway proporciona `PORT` automáticamente; no necesitas fijarlo.
5. Despliega y copia la URL pública que Railway asigne, por ejemplo:
   `https://mediagrab-production.up.railway.app`.

### Frontend en Netlify

1. En `public/config.js`, reemplaza el valor vacío por la URL de Railway:

   ```js
   window.MEDIA_GRAB_API_URL = 'https://mediagrab-production.up.railway.app'
   ```

2. Sube el repositorio a Netlify desde GitHub.
3. Netlify usará `netlify.toml` y publicará la carpeta `public` sin build step.
4. Copia el dominio final de Netlify y actualiza `FRONTEND_ORIGIN` en Railway con ese dominio exacto.

Si cambias el dominio de Netlify, actualiza también `FRONTEND_ORIGIN` en Railway y vuelve a desplegar el servicio.

No expongas públicamente el backend sin autenticación: una URL pública permitiría que otras personas consuman tus recursos y ancho de banda.

## Acceder desde otros dispositivos de tu red

1. Ejecuta MediaGrab en el PC anfitrión.
2. Averigua su IP local, por ejemplo `192.168.1.25`.
3. Desde el celular o tablet conectados a la misma red, abre `http://192.168.1.25:3000`.
4. Si no conecta, permite el puerto 3000 en el firewall del PC.

El servidor escucha en todas las interfaces de red. Es una herramienta personal: no abras ese puerto al internet público sin autenticación.

## Actualizar yt-dlp

Instalación local con pip:

```bash
python3 -m pip install --upgrade yt-dlp
```

En Docker, reconstruye la imagen:

```bash
docker build --pull --no-cache -t mediagrab .
```

## Configuración

- `PORT`: puerto HTTP; por defecto `3000`.
- `YTDLP_PATH`: ruta del ejecutable; por defecto `yt-dlp`.

La app permite como máximo dos descargas simultáneas y cancela cada descarga después de 15 minutos.
