import fetch from 'node-fetch'

let handler = async(m, { conn, groupMetadata, usedPrefix, text, args, isPrems, isOwner, command }) => {
    let btn = [{
                                urlButton: {
                                    displayText: 'Source Code',
                                    url: set.gh
                                }
                            }, {
                                quickReplyButton: {
                                    displayText: 'To Sticker',
                                    id: `${usedPrefix}s`
                                }
                            }]
                            
let urut = text.split`|`
  let one = urut[1]
  let two = urut[2]
  let three = urut[3]
  
let template = (args[0] || '').toLowerCase()
if (!args[0]) {
let caption = `*Contoh Penggunaan Single*
${usedPrefix + command} cecan

*Contoh Penggunaan Multi*
${usedPrefix + command} pinterest |wibu

*List:*
• ${usedPrefix + command} hug
• ${usedPrefix + command} kiss
• ${usedPrefix + command} lizard
• ${usedPrefix + command} neko
• ${usedPrefix + command} pat
• ${usedPrefix + command} 8ball
• ${usedPrefix + command} cat
• ${usedPrefix + command} smug
• ${usedPrefix + command} woof
• ${usedPrefix + command} gasm
• ${usedPrefix + command} 8ball
• ${usedPrefix + command} goose
• ${usedPrefix + command} cuddle
• ${usedPrefix + command} avatar
• ${usedPrefix + command} slap
• ${usedPrefix + command} v3
• ${usedPrefix + command} pat
• ${usedPrefix + command} gecg
• ${usedPrefix + command} feed
• ${usedPrefix + command} fox_girl
• ${usedPrefix + command} lizard
• ${usedPrefix + command} neko
• ${usedPrefix + command} hug
• ${usedPrefix + command} meow
• ${usedPrefix + command} kiss
• ${usedPrefix + command} wallpaper
• ${usedPrefix + command} tickle
• ${usedPrefix + command} spank
• ${usedPrefix + command} waifu
• ${usedPrefix + command} lewd
• ${usedPrefix + command} ngif
`
await conn.sendButtonVid(m.chat, set.giflogo, caption, 'Nih.mp4', 'Back', '.menulist', fakes, adReply)
            }
            
if (command) {
switch (template) {
case '8ball':
case 'cat':
        let cb = await fetch(`https://nekos.life/api/v2/${args[0]}`)
        let cc = await cb.json()
        return conn.sendButton(m.chat, 'Nih kak', set.wm, cc.url, [['Next', `${usedPrefix}${command}`]])
            break
            
case 'hug':
case 'kiss':
case 'lizard':
case 'neko':
case 'pat':
            let db = await fetch(`https://nekos.life/api/${args[0]}`)
        let dc = await db.json()
        return conn.sendButtonGif(m.chat, 'Nihh', set.wm, { url: dc.url }, btn, knimg)
            break
            
            case 'smug':
case 'woof':
case 'gasm':
case '8ball':
case 'goose':
case 'cuddle':
case 'avatar':
case 'slap':
case 'v3':
case 'pat':
case 'gecg':
case 'feed':
case 'fox_girl':
case 'lizard':
case 'neko':
case 'hug':
case 'meow':
case 'kiss':
case 'wallpaper':
case 'tickle':
case 'spank':
case 'waifu':
case 'lewd':
case 'ngif':
        let eb = await fetch(`https://nekos.life/api/v2/img/${args[0]}`)
        let ec = await eb.json()
        return conn.sendButton(m.chat, 'Nih kak', set.wm, ec.url, [['Next', `${usedPrefix}${command}`]])
            break
}

}
}
handler.help = ['nlife <command> <teks>']
handler.tags = ['tools'] 
handler.command = /^nlife$/i

export default handler

