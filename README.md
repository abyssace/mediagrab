# MediaGrab

MediaGrab es una web app personal para descargar un enlace como MP4 o MP3. Usa Node.js, Express, `yt-dlp` y `ffmpeg`.

Úsala solamente con contenido propio o con permiso de descarga. No abras el servidor al internet público sin autenticación.

## Ejecutar localmente en Windows

### Requisitos

- Node.js 18 o superior.
- `yt-dlp` instalado.
- `ffmpeg` instalado.

Instala las dependencias desde PowerShell:

```powershell
cd C:\Users\pedro\Documents\videos
npm install
```

### Iniciar MediaGrab

El servidor requiere un código de acceso. Genera uno aleatorio:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Después inicia MediaGrab. Estas rutas corresponden a la instalación de Windows documentada para este proyecto; sustitúyelas si son diferentes:

```powershell
$env:MEDIA_GRAB_TOKEN = "pega-aqui-tu-token"
$env:YTDLP_PATH = "$env:APPDATA\Python\Python314\Scripts\yt-dlp.exe"
$env:Path += ";$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build-shared\bin"
npm start
```

Abre en el mismo PC:

```text
http://localhost:3000
```

Cuando pulses **Descargar**, introduce el mismo valor de `MEDIA_GRAB_TOKEN`.

El frontend detecta automáticamente `localhost`, direcciones privadas de la red y HTTP local, por lo que usa el backend local. En producción, `public/config.js` apunta a Railway.

## Acceder desde otro dispositivo de la red

El PC que ejecuta MediaGrab y el celular, tablet u otro PC deben estar en la misma red Wi-Fi o LAN.

1. Inicia MediaGrab en el PC anfitrión.
2. En ese PC ejecuta:

   ```powershell
   ipconfig
   ```

3. Busca la dirección **IPv4**, por ejemplo `192.168.1.25`.
4. Desde el otro dispositivo abre:

   ```text
   http://192.168.1.25:3000
   ```

5. Introduce el código de acceso local.

No uses `localhost` desde el celular: allí `localhost` apunta al propio celular.

### Permitir el puerto en Windows Firewall

Si el dispositivo no puede conectarse, abre PowerShell como administrador y ejecuta:

```powershell
New-NetFirewallRule -DisplayName "MediaGrab 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

Esta regla permite el acceso únicamente en redes marcadas como privadas. No abras el puerto en el router ni lo expongas a internet.

## Ejecutar con Docker

El `Dockerfile` incluye Node.js, yt-dlp y ffmpeg:

```powershell
docker build -t mediagrab .
docker run --rm -p 3000:3000 -e MEDIA_GRAB_TOKEN="pega-aqui-tu-token" mediagrab
```

Después accede desde el mismo PC con `http://localhost:3000` o desde otro dispositivo con `http://IP-DEL-PC:3000`.

## Solución de problemas

### `EADDRINUSE: port 3000 already in use`

Ya hay otro servidor ejecutándose. Pulsa `Ctrl + C` en la terminal donde está activo y vuelve a ejecutar `npm start`.

Si no encuentras esa terminal:

```powershell
Get-NetTCPConnection -LocalPort 3000
```

Después detén el proceso usando el `OwningProcess` mostrado:

```powershell
Stop-Process -Id NUMERO_DEL_PROCESO
```

### `Failed to fetch`

- Usa la IPv4 del PC anfitrión, no `localhost`.
- Comprueba que ambos dispositivos estén en la misma red.
- Comprueba Windows Firewall.
- Confirma que `npm start` sigue ejecutándose.
- Recarga la página después de reiniciar el servidor.

### YouTube detecta un bot

Railway puede bloquearse por usar una IP de datacenter aunque el video sea público. Las cookies de YouTube son opcionales y se configuran mediante `YTDLP_COOKIES_B64`; nunca subas cookies a GitHub ni las compartas.

Para crear esa variable desde un archivo Netscape `cookies.txt` local:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\cookies.txt")) | Set-Clipboard
```

Las cookies son credenciales de sesión. Usa solo cookies propias y renuévalas si sospechas que fueron expuestas.

## Actualizar el proyecto

```powershell
git pull origin main
npm install
```

Para iniciar una versión actualizada, detén el servidor anterior y ejecuta de nuevo los comandos de inicio.
