let handler = async (m, { conn, args }) => {
   response = args.join(' ')
  if (!args[0]) throw 'Masukkan Text'
  m.reply('*Wait ngab*\nProses...')
  let res = `https://caliphapi.com/api/rem?text=${response}&text2=Elyas&apikey=ELYASXD`
  conn.sendFile(m.chat, res, 'kaneki.jpg', `Sudah jadi`, m, false)
}
handler.help = ['logorem'].map(v => v + ' <teks>')
handler.tags = ['trash']
handler.command = /^(logorem)$/i
handler.limit = true

export default handler