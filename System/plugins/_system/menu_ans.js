import fetch from 'node-fetch'
let handler = async (m, { conn, usedPrefix, args, command }) => {
let tesxt = `
*Hallo user Bot👋,* 
*Saya adalah Bot WhatsApp Multi Device yang di buat oleh Creator kami.*
Bot ini bisa membantu kamu atau mempermudah kamu membuat sesuatu atau pun mendownload sesuatu seperti:
*Vidio tiktok , Vidio yt , membuat stiker DLL.*
	`
    /*
      //-------DOC TEMPLATE
      const message = {
        document: { url: set.thumb },
        jpegThumbnail: await (await fetch(set.thumb)).buffer(),
        fileName: set.wm,
        mimetype: set.doc,
        fileLength: set.fsizedoc,
        pageCount: set.fpagedoc,
        caption: tesxt,
        footer: set.wm,
        templateButtons: [
            {
                urlButton: {
                    displayText: `WEBSITE`,
                    url: set.web
                }
            },
            {
                urlButton: {
                    displayText: '💌 Group Official',
                    url: set.gcbot
                }
            },
            {
                quickReplyButton: {
                    displayText: '🏅 Owner',
                    id: `${usedPrefix}owner`
                }
            },
            {
                quickReplyButton: {
                    displayText: '🐾 Donasi',
                    id: `${usedPrefix}donasi`
                }
            },
            {
                quickReplyButton: {
                    displayText: '📮 Layanan Dan Jasa',
                    id: `${usedPrefix}store`
                }
            },
        ]
    }
    conn.sendMessage(m.chat, message, m)
    */
    conn.sendHydrated2(m.chat, tesxt.trim(), set.wm, set.logobot, set.web, 'Web', set.gcbot, '💌 Group Official', [
        ['🐾 Donasi', `${usedPrefix}donasi`],
        ['📮 Layanan Dan Jasa', `${usedPrefix}store`],
        ['🏅 Owner', `${usedPrefix}owner`]
      ], m)
  }
//handler.tags = ['main', 'info']
handler.command = /^(panel|help|command)$/i
//handler.help = ['menu_ans']
export default handler