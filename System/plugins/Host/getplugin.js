import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
import { plugins } from '../../lib/plugins.js'
let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
conn.reply(m.chat, set.wait)
    if (!isROwner) return
    let ar = Object.keys(plugins)
    let ar1 = ar.map(v => v.replace('.js', ''))
    if (!text) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} info`
    if (!ar1.includes(text)) return conn.reply(m.chat, `*🗃️ NOT FOUND!*\n==================================\n\n${ar1.map(v => ' ' + v).join`\n`}`)
    let o
    try {
        o = await exec('cat plugins/' + text + '.js')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) conn.reply(m.chat, stdout)
        if (stderr.trim()) conn.reply(m.chat, stderr)
    }
}
handler.help = ['getplugin'].map(v => v + ' <text>')
handler.tags = ['host']
handler.command = /^(getplugin|gp)$/i
handler.rowner = true

export default handler