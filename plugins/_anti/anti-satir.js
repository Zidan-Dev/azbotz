import db from '../lib/database.js'
const isSatir = /(([Kk]enao|[Bb]ims|[Aa]v)a|tumlul|Tumlul|[Gg]wejh|[Oo]kgey|[Ss]iava|[Kk]avan|tenan|[Aa](msu|f[ah])|[Mm]gak|lmao|[Pp]edo|([Bb]an|hoo)h|[Kk]nf)/i // tambahin sendiri

export async function before(m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe)
        return !0
    if (!m.isGroup) return !1
    let chat = db.data.chats[m.chat]
    let bot = db.data.settings[this.user.jid] || {}
    const isAntiSatir = isSatir.exec(m.text)
    let hapus = m.key.participant
    let bang = m.key.id

    if (chat.antiSatir && isAntiSatir) {
        await conn.sendButton(m.chat, `*Kata Satir Terdeteksi!* ${isBotAdmin ? '' : '\n\n_Bot bukan atmin_'}`, wm, ['off antisatir', '/disable antisatir'], m)
        if (isBotAdmin && bot.restrict) {
            // await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    db.data.users[m.sender].warn += 1
    db.data.users[m.sender].banned = true
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: hapus }})
        } else if (!bot.restrict) return m.reply('Semoga harimu suram!')
    }
    return !0
}