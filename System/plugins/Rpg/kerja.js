import db from '../../lib/database.js'
let handler = async (m, {conn, command, args, usedPrefix}) => {
  let user = db.data.users[m.sender]
let type = (args[0] || '').toLowerCase()
let time = user.lastjb + 300000
//let __timers = (new Date - user.lastkerja)
   // let _timers = (0 - __timers)
   // let timers = clockString(_timers) 
    //JANGAN DI OTAK ATIK
//PEMBATAS
let penumpan = ['mas mas','bapak bapak','cewe sma','bocil epep','emak emak']
let penumpang = penumpan[Math.floor(Math.random() * penumpan.length)]
let daganga = ['wortel','sawi','selada','tomat','seledri','cabai','daging','ikan','ayam']
let dagangan = daganga[Math.floor(Math.random() * daganga.length)]
let pasie = ['sakit kepala','cedera','luka bakar','patah tulang']
let pasien = pasie[Math.floor(Math.random() * pasie.length)]
let pane = ['Wortel','Kubis','stowbery','teh','padi','jeruk','pisang','semangka','durian','rambutan']
let panen = pane[Math.floor(Math.random() * pane.length)]
let bengke = ['mobil','motor','becak','bajai','bus','angkot','becak','sepeda']
let bengkel = bengke[Math.floor(Math.random() * bengke.length)]
let ruma = ['Membangun Rumah','Membangun Gedung','Memperbaiki Rumah','Memperbaiki Gedung','Membangun Fasilitas Umum','Memperbaiki Fasilitas Umum']
let rumah = ruma[Math.floor(Math.random() * ruma.length)]

let pppecat = ['Ruko Kebakaran','LO NGOCOK DIDEPAN UMUM','Males Malesan','Ngew istrinya yg punya ruko']
let alasanpecat = pppecat[Math.floor(Math.random() * pppecat.length)]
let ddppecat = ['Bakar Pasien','Jual Organ Dalem ke Lapak ilegal','serinv telat']
let alasanpasien = ddppecat[Math.floor(Math.random() * ddppecat.length)]
//Uang
let uangm = Math.floor(Math.random() * 10) + 4000
let duit = Math.floor(Math.random() * 20) + 2500
let duitm = Math.floor(Math.random() * 50) + 9500
let duitd = Math.floor(Math.random() * 62) + 5200
let duitr = Math.floor(Math.random() * 20) + 4200
let duitk = Math.floor(Math.random() * 70) + 7800
//ANJAY
let _pecat= `${pickRandom(['1', '1', '1', '1'])}`
            let pecat = (_pecat * 1)
            let ppecat = `KAMU KENA PECAT KARNA KAMU ${alasanpecat}`
let _dpecat = `${pickRandom(['1', '0', '0', '1'])}`
            let dpecat = (_dpecat * 1)
            let dppecat = `KAMU DI PECAT KARNA ${alasanpasien}`
//GAK RAPIH G GANTENG
const sections = [
    {
	title: '🌟 List Kerjaan',
	rows: [
{title: "🛵 Ojek", rowId: usedPrefix + command + ' ojek'},
{title: "🥗 Pedagang", rowId: usedPrefix + command + ' pedagang'},
{title: "🏥 ️Dokter", rowId: usedPrefix + command + ' dokter'},
{title: "🌾 Petani", rowId: usedPrefix + command + ' petani'},
{title: "🏯 Montir", rowId: usedPrefix + command + ' montir'},
{title: "⚒️ Kuli", rowId: usedPrefix + command + ' kuli'}
	]
    }
]

const listMessage = {
  text: `⚡ Silakan pilih kerjaan di bawah...`,
  footer: set.wm,
  title: `⎔───「 ${command} 」───⎔`,
  buttonText: `☂️ Klik Disini ☂️`,
  sections
}
//PEMBATAS\\
if (/kerjadulu|kerja|work/i.test(command)) {
switch(type) {
	case 'ojek':
	if (user.ojek == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja\nSaatnya istirahat selama ${clockString(time - new Date())}`
	user.atm += uangm
user.lastkerja = new Date * 1
conn.reply(m.chat, `Kamu Sudah Mengantarkan *${penumpang}* 🚗\nDan mendapatkan uang senilai *Rp ${uangm} 💹*`)
break
     case 'pedagang':
     if (user.pedagang == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja,Saatnya istirahat selama\n🕜 ${clockString(time - new Date())}`
	user.atm += duit
user.lastkerja = new Date * 1
conn.reply(m.chat, `Ada pembeli yg membeli *${dagangan}* 🛒\nDan mendapatkan uang senilai *Rp ${duit} 💹*`)
	if (pecat > 1 ) {
                   user.pedagang -= pecat * 1
                   m.reply(ppecat)
            }
break
      case 'dokter':
 if (user.dokter == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja,Saatnya istirahat selama\n🕜 ${clockString(time - new Date())}`
	user.atm += duitm
user.lastkerja = new Date * 1
conn.reply(m.chat, `Kamu menyembuhkan pasien *${pasien}* 💉\nDan mendapatkan uang senilai *Rp ${duitm}* 💹`)
break
       case 'petani':
if (user.petani == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja,Saatnya istirahat selama\n🕜 ${clockString(time - new Date())}`
	user.atm += uangm
user.lastkerja = new Date * 1
conn.reply(m.chat, `${panen} Sudah Panen !🌽 Dan menjualnya 🧺\nDan mendapatkan uang senilai Rp *${duitd} 💹*`)
break
     case 'montir':
 if (user.montir == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja,Saatnya istirahat selama\n🕜 ${clockString(time - new Date())}`
	user.atm += duitr
user.lastkerja = new Date * 1
conn.reply(m.chat, `Kamu Baru saja mendapatkan pelanggan dan memperbaiki *${bengkel} 🔧*\nDan kamu mendapatkan uang senilai *Rp ${duitr}* 💹`)
break
      case 'kuli':
 if (user.kuli == false) throw 'ini bukan tugas kamu atau kamu pengangguran!'
if (new Date - user.lastkerja < 300000)  throw `Kamu sudah bekerja,Saatnya istirahat selama\n🕜 ${clockString(time - new Date())}`
	user.atm += duitk
user.lastkerja = new Date * 1
conn.reply(m.chat, `Kamu baru saja selesai ${rumah} 🔨\nDan mendapatkan uang senilai *Rp ${duitk} 💹*`)
break
default:
                        return conn.sendMessage(m.chat, listMessage, {quoted: fakes})
                }
                }
                
                }
///AKSJDDJ
handler.help = ['kerja','work']
handler.tags = ['rpg']
handler.command = /^kerja$/i 

export default handler
//JANGAN DIUBAH YA YG DIBAWAH
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}
function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return ['\n' + d, ' *Days ☀️*\n ', h, ' *Hours 🕐*\n ', m, ' *Minute ⏰*\n ', s, ' *Second ⏱️* '].map(v => v.toString().padStart(2, 0)).join('')
}