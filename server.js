'use strict'

const express = require('express')
const fs = require('fs')
const fsp = fs.promises
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const app = express()
const port = Number.parseInt(process.env.PORT || '3000', 10)
const ytdlpPath = process.env.YTDLP_PATH || 'yt-dlp'
const maxConcurrentDownloads = 2
const timeoutMs = 15 * 60 * 1000
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
let activeDownloads = 0

app.use(express.json({ limit: '20kb' }))

app.use((req, res, next) => {
  const origin = req.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length')
    res.setHeader('Vary', 'Origin')
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403)
    return
  }
  next()
})

app.use(express.static(path.join(__dirname, 'public')))

function errorMessage(error, stderr) {
  const text = `${stderr || ''}\n${error && error.message ? error.message : ''}`.toLowerCase()
  if (text.includes('ffmpeg') && (text.includes('not found') || text.includes('required') || text.includes('location'))) return 'Falta ffmpeg en el servidor. Instálalo para poder convertir o unir archivos.'
  if (text.includes('login') || text.includes('private video') || text.includes('sign in')) return 'El video es privado o requiere iniciar sesión.'
  if (text.includes('unsupported url') || text.includes('no suitable extractor') || text.includes('url not supported')) return 'La URL no es compatible.'
  if (text.includes('requested format is not available') || text.includes('video unavailable') || text.includes('this video is unavailable')) return 'El video no está disponible o el formato solicitado no existe.'
  if (text.includes('429') || text.includes('too many requests') || text.includes('rate limit')) return 'El servicio está recibiendo demasiadas solicitudes. Inténtalo más tarde.'
  if (error && error.killed) return 'La descarga tardó demasiado y fue cancelada.'
  if (error && error.code === 'ENOENT') return 'No se encontró yt-dlp en el servidor.'
  return 'No se pudo completar la descarga. Revisa la URL e inténtalo de nuevo.'
}

function runYtdlp(url, format, directory) {
  const formatArgs = format === 'mp3'
    ? ['-x', '--audio-format', 'mp3', '--audio-quality', '0']
    : ['-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b', '--merge-output-format', 'mp4']
  const args = [
    '--no-playlist', '--no-warnings', '--windows-filenames', '--no-simulate',
    '-P', directory, '-o', '%(title)s.%(ext)s', ...formatArgs,
    '--print', 'after_move:filepath', '--', url,
  ]

  return new Promise((resolve, reject) => {
    execFile(ytdlpPath, args, {
      cwd: directory, timeout: timeoutMs, maxBuffer: 2 * 1024 * 1024, windowsHide: true,
    }, async (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp stderr:', stderr || error.message)
        reject({ error, stderr })
        return
      }
      const printedPaths = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      let filePath = printedPaths.reverse().find((candidate) => fs.existsSync(candidate))
      if (!filePath) {
        const files = await fsp.readdir(directory, { withFileTypes: true })
        const regularFile = files.find((entry) => entry.isFile())
        if (regularFile) filePath = path.join(directory, regularFile.name)
      }
      if (!filePath) {
        const missingOutput = new Error('yt-dlp no produjo ningún archivo')
        console.error('yt-dlp stderr:', stderr || missingOutput.message)
        reject({ error: missingOutput, stderr })
        return
      }
      resolve(filePath)
    })
  })
}

app.post('/api/download', async (req, res) => {
  if (activeDownloads >= maxConcurrentDownloads) {
    res.status(429).json({ error: 'Hay dos descargas en curso. Inténtalo de nuevo en unos minutos.' })
    return
  }
  const { url, format } = req.body || {}
  if (typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ error: 'Debes proporcionar una URL.' })
    return
  }
  let parsedUrl
  try { parsedUrl = new URL(url.trim()) } catch {
    res.status(400).json({ error: 'La URL no es válida.' })
    return
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: 'La URL debe comenzar con http:// o https://.' })
    return
  }
  if (format !== 'mp3' && format !== 'mp4') {
    res.status(400).json({ error: 'El formato debe ser mp4 o mp3.' })
    return
  }

  activeDownloads += 1
  let directory
  try {
    directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'mediagrab-'))
    const filePath = await runYtdlp(parsedUrl.toString(), format, directory)
    const filename = path.basename(filePath)
    res.download(filePath, filename, async (downloadError) => {
      try {
        if (downloadError && !res.headersSent) {
          console.error('Error enviando archivo:', downloadError)
          res.status(500).json({ error: 'No se pudo enviar el archivo descargado.' })
        }
      } finally {
        await fsp.rm(directory, { recursive: true, force: true })
        activeDownloads -= 1
      }
    })
  } catch (failure) {
    console.error('Error de descarga:', failure.stderr || failure.error || failure)
    if (directory) await fsp.rm(directory, { recursive: true, force: true })
    activeDownloads -= 1
    if (!res.headersSent) res.status(500).json({ error: errorMessage(failure.error, failure.stderr) })
  }
})

app.listen(port, '0.0.0.0', () => console.log(`MediaGrab escuchando en http://0.0.0.0:${port}`))
