# MediaGrab

MediaGrab es una web app personal para descargar un enlace como MP4 o MP3. Usa Node.js, Express, `yt-dlp` y `ffmpeg`.

Úsala solamente con contenido propio o con permiso de descarga. No abras el servidor al internet público sin autenticación.

## Ejecutar localmente en Windows

### Requisitos

- Node.js 18 o superior.
- `yt-dlp` instalado.
- `ffmpeg` instalado.

En este equipo, las rutas usadas son:

```text
C:\Users\pedro\AppData\Roaming\Python\Python314\Scripts\yt-dlp.exe
C:\Users\pedro\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build-shared\bin
```

Si las rutas son diferentes, sustitúyelas en los comandos siguientes.

### Instalar dependencias

Desde PowerShell, dentro del proyecto:

```powershell
cd C:\Users\pedro\Documents\videos
npm install
```

### Iniciar MediaGrab

El backend requiere un código de acceso local. Puedes usar cualquier valor largo y privado:

```powershell
$env:MEDIA_GRAB_TOKEN = "escribe-aqui-un-token-local"
$env:YTDLP_PATH = "$env:APPDATA\Python\Python314\Scripts\yt-dlp.exe"
$env:Path += ";$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build-shared\bin"
npm start
```

Abre en el mismo PC:

```text
http://localhost:3000
```

Al descargar, MediaGrab pedirá el mismo valor configurado en `MEDIA_GRAB_TOKEN`. El valor solo existe en esa terminal y no se sube a GitHub.

Para generar un token aleatorio:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Importante sobre `config.js`

`public/config.js` contiene la URL de Railway para producción. El frontend detecta automáticamente cuando se abre por `localhost`, una IP privada o HTTP local, y en esos casos usa el backend local. No necesitas cambiar ese archivo para acceder desde tu red local.

## Acceder desde un celular, tablet u otro PC

Todos los dispositivos deben estar conectados a la misma red Wi-Fi o LAN.

1. Inicia MediaGrab en el PC anfitrión con los comandos anteriores.
2. En el PC anfitrión ejecuta:

   ```powershell
   ipconfig
   ```

3. Busca la dirección **IPv4**, por ejemplo `192.168.1.25`.
4. Desde el otro dispositivo abre:

   ```text
   http://192.168.1.25:3000
   ```

5. Introduce el código de acceso local cuando lo solicite.

Si Windows Firewall bloquea la conexión, abre PowerShell como administrador y permite el puerto solo en redes privadas:

```powershell
New-NetFirewallRule -DisplayName "MediaGrab 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

No uses `localhost` desde el celular: `localhost` apunta al propio celular, no al PC anfitrión.

## Ejecutar con Docker en la red local

Docker ya incluye Node.js, yt-dlp y ffmpeg:

```powershell
docker build -t mediagrab .
docker run --rm -p 3000:3000 -e MEDIA_GRAB_TOKEN="escribe-aqui-un-token-local" mediagrab
```

Después usa la IPv4 del PC anfitrión:

```text
http://IP-DEL-PC:3000
```

## Solución de problemas locales

### `EADDRINUSE: port 3000 already in use`

Ya hay otro servidor ejecutándose. Pulsa `Ctrl + C` en la terminal donde está activo y vuelve a ejecutar `npm start`.

Si no encuentras esa terminal:

```powershell
Get-NetTCPConnection -LocalPort 3000
```

Después puedes detener el proceso usando el `OwningProcess` mostrado:

```powershell
Stop-Process -Id NUMERO_DEL_PROCESO
```

### `Failed to fetch` desde otro dispositivo

- Comprueba que ambos dispositivos estén en la misma red.
- Usa `http://IP-DEL-PC:3000`, no `localhost`.
- Comprueba la regla del firewall.
- Confirma que el servidor sigue abierto en la terminal.
- Recarga la página después de reiniciar el servidor.

### YouTube pide iniciar sesión o detecta un bot

Railway puede recibir bloqueos anti-bot por usar una IP de datacenter. Las cookies son opcionales. Si configuras `YTDLP_COOKIES_B64`, usa únicamente cookies propias, nunca las subas a GitHub y no las compartas.

## Despliegue: Netlify + Railway

La aplicación se separa en dos servicios:

- **Netlify** sirve el frontend estático de `public/`.
- **Railway** ejecuta el backend usando el `Dockerfile`, incluyendo Node.js, yt-dlp y ffmpeg.

### Variables en Railway

Configura estas variables en el servicio:

```text
YTDLP_PATH=/usr/local/bin/yt-dlp
FRONTEND_ORIGIN=https://TU-SITIO.netlify.app
MEDIA_GRAB_TOKEN=un-token-largo-y-aleatorio
```

Railway proporciona `PORT` automáticamente. `YTDLP_COOKIES_B64` es opcional.

### Frontend en Netlify

`public/config.js` debe contener la URL pública de Railway:

```js
window.MEDIA_GRAB_API_URL = 'https://TU-SERVICIO.up.railway.app'
```

El sitio se publica desde la carpeta `public` sin build step.

El workflow `.github/workflows/deploy.yml` dispara el Build Hook de Netlify. El secreto `NETLIFY_BUILD_HOOK` debe estar configurado en GitHub Actions. No guardes ese valor en el código.

## Cookies opcionales de YouTube en Railway

Si YouTube bloquea todas las descargas desde Railway:

1. Exporta localmente un archivo Netscape `cookies.txt` de YouTube con una herramienta de confianza.
2. No subas ese archivo a GitHub ni lo envíes a nadie.
3. En PowerShell conviértelo a Base64:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\cookies.txt")) | Set-Clipboard
   ```

4. Crea en Railway la variable secreta `YTDLP_COOKIES_B64` y pega el contenido.
5. Redespliega el servicio.

Las cookies son credenciales de sesión. Renuévalas o cierra la sesión si sospechas que fueron expuestas.

## Actualizar el proyecto

```powershell
git pull origin main
npm install
```

Para desplegar cambios:

```powershell
git add .
git commit -m "Describe el cambio"
git push origin main
```

Railway puede desplegar el backend desde `main` y GitHub Actions dispara el despliegue de Netlify cuando haya créditos disponibles.
