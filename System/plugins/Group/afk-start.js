import db from '../../lib/database.js'

let handler = async (m, { text, conn }) => {
    let user = db.data.users[m.sender]
    user.afk = + new Date
    user.afkReason = text
    conn.reply(m.chat, `
  ${conn.getName(m.sender)} is now AFK${text ? ': ' + text : ''}
  `)
}
handler.help = ['afk [alasan]']
handler.tags = ['group']
handler.command = /^afk$/i

export default handler