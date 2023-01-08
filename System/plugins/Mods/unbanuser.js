import db from '../../lib/database.js'

let handler = async (m, { conn, args }) => {
    if (!args || !args[0]) throw 'Yang mau di Unban siapa?'
    let mention = m.mentionedJid[0] || conn.parseMention(args[0]) || (args[0].replace(/[@.+-]/g, '').replace(' ', '') + '@s.whatsapp.net') || ''
    if (!mention) throw 'Tag salah satu lah'
    if (!(mention in db.data.users)) throw 'User tidak terdaftar dalam DATABASE!!'
    let user = db.data.users[mention]
    if (!user.banned) throw 'User tidak Terbanned!!'
    user.banned = false
    user.BannedReason = ''
    user.warn = 0
    await conn.reply(m.chat,'Berhasil unbanned!!')
    conn.reply(m.chat,'Kamu telah di Unbanned!!', mention)
}
handler.help = ['unbanuser']
handler.tags = ['owner']
handler.command = /^unban(user)?$/i
handler.rowner = true
export default handler
