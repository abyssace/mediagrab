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


