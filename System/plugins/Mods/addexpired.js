import db from '../../lib/database.js'
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) throw `Masukan angka mewakili jumlah hari!\n\ncontoh:\n${usedPrefix + command} 30`

    let who
    if (m.isGroup) who = args[1] ? args[1] : m.chat
    else who = args[1]

    var jumlahHari = 86400000 * args[0]
    var now = new Date() * 1
    if (now < db.data.chats[who].expired) db.data.chats[who].expired += jumlahHari
    else db.data.chats[who].expired = now + jumlahHari
    let caption = `Berhasil menetapkan hari kedaluarsa untuk ${await conn.getName(who)} selama ${args[0]} hari.\n\nHitung Mundur : ${msToDate(db.data.chats[who].expired - now)}`
    conn.sendButton(m.chat, caption, set.wm, null, [['Delete Expired', '/delexpired'], ['Cek Expired', '/cekexpired']], m)
}
handler.help = ['addexpired <hari>']
handler.tags = ['host']
handler.command = /^(addexpired)$/i
handler.rowner = true
export default handler

function msToDate(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, ' *Days ☀️*\n ', h, ' *Hours 🕐*\n ', m, ' *Minute ⏰*\n ', s, ' *Second ⏱️* '].map(v => v.toString().padStart(2, 0)).join('')
}