let handler = async(m, { conn }) => {
   var a = await require('@bochilteam/scraper').liputan6()
   var b = JSON.parse(JSON.stringify(a))
   //var c = await conn.rand(b)
   var c = b[Math.floor(Math.random() * b.length)]
   var { title, link, image, description, date, label } = c
   var sell = `📺 *Liputan6 News*
🌐 *Berita:* ${title}
📄 *Deskripsi:* ${description}
⌚ *Date:* ${date}
🛰️ *Source Url:* ${link}`.trim()
   conn.sendButton(m.chat, `${sell}`, set.wm, null, [['Liputan6 News', '/liputan6']], m)
 //  conn.sendButton(m.chat, sell, wm, null, [['Liputan6 News', '.liputan6']], m)
}
handler.help = ['liputan6news']
handler.tags = ['news']
handler.command = /^liputan6news?$/i
handler.limit = true

export default handler