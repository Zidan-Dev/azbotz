import { format } from 'util'
// let path = require('path')
import { spawn } from 'child_process'

// Font By MFarelS:V
let fontPath = '/System/src/font/Zahraaa.ttf'
let handler = async (m, { conn, args }) => {
    if (!set.support.convert &&
        !set.support.magick &&
        !set.support.gm) return handler.disabled = true // Disable if doesnt support
    let inputPath = '../System/src/kertas/magernulis1.jpg'
    let d = new Date
    let tgl = d.toLocaleDateString('id-Id')
    let hari = d.toLocaleDateString('id-Id', { weekday: 'long' })
    let teks = args.join` `
    // conn.reply(m.chat, util.format({fontPath, inputPath, outputPath, tgl, hari, teks}), m)
    let bufs = []
    const [_spawnprocess, ..._spawnargs] = [...(set.support.gm ? ['gm'] : set.support.magick ? ['magick'] : []),
        'convert',
        inputPath,
        '-font',
        fontPath,
        '-fill',
        'blue',
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+78',
        hari,
        '-font',
        fontPath,
        '-fill',
        'blue',
        '-size',
        '1024x784',
        '-pointsize',
        '18',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+102',
        tgl,
        '-font',
        fontPath,
        '-fill',
        'blue',
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '-7.5',
        '-annotate',
        '+344+142',
        teks,
        'jpg:-'
    ]
    spawn(_spawnprocess, _spawnargs)
        .on('error', e => conn.reply(m.chat,format(e)))
        .on('close', () => {
            conn.sendFile(m.chat, Buffer.concat(bufs), 'nulis.jpg', 'Hati² ketahuan:v', m)
        })
        .stdout.on('data', chunk => bufs.push(chunk))
}
handler.help = ['n'].map(v => v + 'ulis2 <teks>')
handler.tags = ['maker']
handler.command = /^nulis2$/i

export default handler

// BY MFARELS
// https://GitHub.com/MFarelS/