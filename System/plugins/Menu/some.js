import fetch from 'node-fetch'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/sistem.js'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async(m, { conn, groupMetadata, usedPrefix, text, args, isPrems, isOwner, command }) => {
let btn = [{
                                urlButton: {
                                    displayText: 'Source Code',
                                    url: set.gh
                                }
                            }, {
                                callButton: {
                                    displayText: 'Number Phone Owner',
                                    phoneNumber: set.author
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
if (!args[0] || !one) {
let caption = `*Contoh Penggunaan Single*
${usedPrefix + command} cecan

*Contoh Penggunaan Multi*
${usedPrefix + command} pinterest |wibu

*List:*
• ${usedPrefix + command} animal
• ${usedPrefix + command} animu
• ${usedPrefix + command} binary
• ${usedPrefix + command} token
• ${usedPrefix + command} base64
• ${usedPrefix + command} facts
• ${usedPrefix + command} img
• ${usedPrefix + command} joke
• ${usedPrefix + command} lyrics
• ${usedPrefix + command} mc
• ${usedPrefix + command} meme
• ${usedPrefix + command} pokedex
• ${usedPrefix + command} canvas
`
await conn.sendButtonVid(m.chat, logo, caption, 'Nih.mp4', 'Back', '.menulist', fakes, adReply)
            }
            
try {
if (command) {
switch (template) {
case 'animal':
        let cb = await fetch(`https://some-random-api.ml/animal/${one}`)
        let cc = await cb.json()
        return conn.sendButtonImg(m.chat, cc.image, cc.fact, 'Nih.jpg', 'To Sticker', '.s', fakes, adReply)
            
case 'animu':
            let db = await fetch(`https://some-random-api.ml/animu/${one}`)
        let dc = await db.json()
        return conn.sendButtonGif(m.chat, 'Nihh', wm, { url: dc.link }, btn, knimg)
            case 'binary':
        let eb = await fetch(`https://some-random-api.ml/binary?text=${one}`)
        let ec = await eb.json()
        return conn.reply(m.chat, ec.binary)
            case 'token':
        let fb = await fetch(`https://some-random-api.ml/token`)
        let fc = await fb.json()
        return conn.reply(m.chat, fc.token)
            case 'base64':
        let gb = await fetch(`https://some-random-api.ml/base64?encode=${one}`)
        let gc = await gb.json()
        return conn.reply(m.chat, gc.base64)
            break
            
            case 'facts':
        let hb = await fetch(`https://some-random-api.ml/facts/${one}`)
        let hc = await hb.json()
        return conn.reply(m.chat, hc.fact)
            
            case 'img':
        let ib = await fetch(`https://some-random-api.ml/img/${one}`)
        let ic = await ib.json()
        return conn.sendButtonImg(m.chat, ic.link, wm, 'Nih.jpg', 'To Sticker', '.s', fakes, adReply)
            
            case 'joke':
        let jb = await fetch(`https://some-random-api.ml/joke`)
        let jc = await jb.json()
        return conn.reply(m.chat, jc.joke)
            
            case 'lyrics':
        let kb = await fetch(`https://some-random-api.ml/lyrics?title=${one}`)
        let kc = await kb.json()
        let kd = `${kc.title}
        ${kc.author}
        ${kc.lyrics}
        `
            return conn.sendButtonImg(m.chat, kc.thumbnail.genius, kd, kc.link.genius, 'To Sticker', '.s', fakes, adReply)
            
            case 'mc':
        let lb = await fetch(`https://some-random-api.ml/mc?username=${one}`)
        let lc = await lb.json()
        return conn.reply(m.chat, lc.uuid)
            
            case 'meme':
        let mb = await fetch(`https://some-random-api.ml/meme`)
        let mc = await mb.json()
            return conn.sendButtonImg(m.chat, mc.image, mc.caption, mc.id + '|' + mc.category, 'To Sticker', '.s', fakes, adReply)
            
            case 'pokedex':
            let nb = await fetch(`https://some-random-api.ml/pokedex?pokemon=${one}`)
        let nc = await nb.json()
        let nd = `${nc.name}
        ${nc.id}
        ${Array.from(nc.type)}
        ${Array.from(nc.species)}
        ${Array.from(nc.abilities)}
        ${nc.height}
        ${nc.weight}
        ${nc.base_experience}
        ${Array.from(nc.gender)}
        ${Array.from(nc.egg_groups)}
        ${nc.stats.hp}
        ${nc.stats.attack}
        ${nc.stats.defense}
        ${nc.stats.sp_atk}
        ${nc.stats.sp_def}
        ${nc.stats.speed}
        ${nc.stats.total}
        ${nc.family.evolutionStage}
        ${Array.from(nc.familyevolutionLine)}
        ${nc.sprites.normal}
        ${nc.generation}
        `
        return conn.sendButtonGif(m.chat, nd, nc.description, { url: nc.sprites.animated }, btn, knimg)
            
            case 'canvas':
            let a_ = m.quoted ? m.quoted : m
  let b_ = (a_.msg || a_).mimetype || ''
  if (!b_) throw 'No media found'
  let c_ = await a_.download()
  let e_ = new Sticker(c_, { pack: set.packname, author: set.author, type: StickerTypes.FULL })
  let d_
  try {
  if (/webp/g.test(b_)) d_ = await webp2png(c_)
        else if (/image/g.test(b_)) d_ = await uploadImage(c_)
        else if (/video/g.test(b_)) d_ = await uploadFile(c_)
        else if (/viewOnce/g.test(b_)) d_ = await uploadFile(c_)
        if (typeof d_ !== 'string') d_ = await uploadImage(c_)
        else if (/gif/g.test(b_)) d_ = e_
        } catch (e) {
        throw eror
        }
        let wnt = `https://some-random-api.ml/canvas/${one}?avatar=${d_}`
        return conn.sendButtonImg(m.chat, wnt, wm, 'Nih.jpg', 'Sticker', '.s', fakes, adReply)
            
}
}
} catch (e) {
throw eror
}
}
handler.help = ['some <command> <teks>']
handler.tags = ['tools'] 
handler.command = /^some$/i
export default handler
