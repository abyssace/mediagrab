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
   MEDIA_GRAB_TOKEN=un-token-largo-y-aleatorio
   ```

   Railway proporciona `PORT` automáticamente; no necesitas fijarlo. `MEDIA_GRAB_TOKEN` es obligatorio para descargar.
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

### Cookies opcionales de YouTube

Railway puede recibir un bloqueo anti-bot de YouTube aunque el video sea público. Si ocurre, puedes configurar cookies propias de YouTube mediante la variable secreta opcional `YTDLP_COOKIES_B64`. El backend las usa solo durante la descarga y elimina el archivo temporal al terminar.

1. Exporta desde tu navegador un archivo Netscape `cookies.txt` de YouTube usando una herramienta local de confianza.
2. No subas ese archivo a GitHub ni lo envíes a nadie.
3. En PowerShell, conviértelo a una sola línea Base64:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\cookies.txt")) | Set-Clipboard
   ```

4. En Railway crea la variable secreta `YTDLP_COOKIES_B64` y pega el contenido.
5. Redespliega el servicio.

Las cookies son credenciales de sesión: usa una cuenta personal, no las registres en logs y renuévalas o cierra la sesión si sospechas que quedaron expuestas. `--cookies-from-browser` no funciona en Railway porque el servidor no tiene tu navegador.

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
- `FRONTEND_ORIGIN`: dominio de Netlify permitido por CORS.
- `MEDIA_GRAB_TOKEN`: código compartido obligatorio para las descargas.
- `YTDLP_COOKIES_B64`: cookies de YouTube en Base64; opcional.

La app permite como máximo dos descargas simultáneas y cancela cada descarga después de 15 minutos.
