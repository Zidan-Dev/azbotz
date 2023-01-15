import { join } from 'path'
import { xpRange } from '../../lib/levelling.js'
import db from '../../lib/database.js'
import { readFileSync } from 'fs'
let handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = db.data.users[m.sender]
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let { exp, limit, level, role, money, lastclaim, lastweekly, registered, regTime, age, banned, pasangan } = db.data.users[who]
    let { min, xp, max } = xpRange(level, set.multiplier)
    let name = await conn.getName(who)
    let pp = await conn.profilePictureUrl(who).catch(_ => readFileSync('System/src/img/avatar_contact.png'))

    if (typeof db.data.users[who] == "undefined") {
      db.data.users[who] = {
        exp: 0,
        limit: 10,
        lastclaim: 0,
        registered: false,
        name: conn.getName(m.sender),
        age: -1,
        regTime: -1,
        afk: -1,
        afkReason: '',
        banned: false,
        level: 0,
        lastweekly: 0,
        role: 'Warrior V',
        autolevelup: false,
        money: 0,
        pasangan: "",
      }
     }
     let math = max - xp
let caption = `*YOUR PROFILE*
*🏷️ Nama:* *(${name})* ${registered ? '(' + name + ') ' : ''} ( @${who.split("@")[0]} )
*❤️ Pasangan:*  ${pasangan ? `@${pasangan.split("@")[0]}` : `Tidak Punya`}
*💲 Money:* *RP* ${money}
*🏆 Level* ${level}
*🎋 Role:* ${role}
*🧬 XP:* TOTAL ${exp} (${exp - min} / ${xp}) [${math <= 0 ? `Siap untuk *${usedPrefix}levelup*` : `${math} XP lagi untuk levelup`}]
*📨 Terdaftar:* ${registered ? 'Ya (' + new Date(regTime).toLocaleString() + ')' : 'Tidak'} ${lastclaim > 0 ? '\n*⏱️Terakhir Klaim:* ' + new Date(lastclaim).toLocaleString() : ''}\n\n Ketik ${usedPrefix}inv untuk melihat Inventory RPG`
await conn.sendButton(m.chat, caption, set.wm, pp, [['Menu', `${usedPrefix}menu`],['Owner', `${usedPrefix}owner`]], m, { mentions: conn.parseMention(caption) })
}

handler.help = ['profile']
handler.tags = ['rpg']

handler.command = /^(pro(fil)?(file)?)$/i

export default handler