/** @type {import('@adiwajshing/baileys')} */
const {
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    extractMessageContent,
    WAMessageStubType,
    //jidNormalizedUser,
    //getBinaryNodeChild,
    getContentType
} = (await import('@adiwajshing/baileys')).default

import path from 'path'
import chalk from 'chalk'
import fetch from 'node-fetch'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type'
import { fileURLToPath } from 'url'
import Connection from './connection.js'
import jimp from 'jimp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './exif.js'
import { toAudio, toPTT } from './converter.js'
import moment from 'moment-timezone'
import translate  from 'translate-google-api'
import translate2 from 'translate-google'
import axios from 'axios'
import PhoneNumber from 'awesome-phonenumber'

let fpdoc = '1'.repeat(10)

/** @param {import('./connection').Socket} conn */
export function HelperConnection(conn, options = {}) {
    const botUser = conn.user || {}
    /** @type {import('@adiwajshing/baileys').WASocket | import('@adiwajshing/baileys').WALegacySocket} */
    let sock = Object.defineProperties(conn, {
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
                return jid?.decodeJid?.()
            }
        },
        logger: {
            value: {
                info(...args) {
                    console.log(
                        chalk.bold.bgRgb(51, 204, 51)('INFO '),
                        `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                        chalk.cyan(util.format(...args))
                    )
                },
                error(...args) {
                    console.log(
                        chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                        `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                        chalk.rgb(255, 38, 0)(util.format(...args))
                    )
                },
                warn(...args) {
                    console.log(
                        chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                        `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                        chalk.redBright(util.format(...args))
                    )
                },
                trace(...args) {
                    console.log(
                        chalk.grey('TRACE '),
                        `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                        chalk.white(util.format(...args))
                    )
                },
                debug(...args) {
                    console.log(
                        chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                        `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                        chalk.white(util.format(...args))
                    )
                }
            },
            enumerable: true,
            writable: true,
        },
        getFile: {
            /**
             * getBuffer hehe
             * @param {fs.PathLike} PATH 
             * @param {Boolean} saveToFile
             */
            async value(PATH, saveToFile = false) {
                let res, filename
                const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
                if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
                const type = await fileTypeFromBuffer(data) || {
                    mime: 'application/octet-stream',
                    ext: '.bin'
                }
                if (data && saveToFile && !filename) (filename = path.join(__dirname, '../../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename)
                    }
                }
            },
            enumerable: true,
            writable: true,
        },
         waitEvent: {
             /**
              * waitEvent
              * @param {String} eventName 
              * @param {Boolean} is 
              * @param {Number} maxTries 
              */
             value(eventName, is = () => true, maxTries = 25) { //Idk why this exist?
                 return new Promise((resolve, reject) => {
                     let tries = 0
                     let on = (...args) => {
                         if (++tries > maxTries) reject('Max tries reached')
                         else if (is()) {
                             conn.ev.off(eventName, on)
                             resolve(...args)
                         }
                     }
                     conn.ev.on(eventName, on)
                 })
             }
         },
        sendFile: {
            /**
             * Send Media/File with Automatic Type Specifier
             * @param {String} jid
             * @param {String|Buffer} path
             * @param {String} filename
             * @param {String} caption
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Boolean} ptt
             * @param {Object} options
             */
            async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
                let type = await conn.getFile(path, true)
                let { res, data: file, filename: pathFile } = type
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                const fileSize = fs.statSync(pathFile).size / 1024 / 1024
                if (fileSize >= 20000) throw new Error('File size is too big!')
                let opt = {}
                if (quoted) opt.quoted = quoted
                if (!type) options.asDocument = true
                let mtype = '', mimetype = options.mimetype || type.mime, convert
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
                else if (/video/.test(type.mime)) mtype = 'video'
                else if (/audio/.test(type.mime)) (
                    convert = await (ptt ? toPTT : toAudio)(file, type.ext),
                    file = convert.data,
                    pathFile = convert.filename,
                    mtype = 'audio',
                    mimetype = options.mimetype || 'audio/ogg; codecs=opus'
                )
                else mtype = 'document'
                if (options.asDocument) mtype = 'document'

                delete options.asSticker
                delete options.asLocation
                delete options.asVideo
                delete options.asDocument
                delete options.asImage

                let message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split('/').pop()
                }
                /**
                 * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
                 */
                let m
                try {
                    m = await conn.sendMessage(jid, message, { ...opt, ...options })
                } catch (e) {
                    console.error(e)
                    m = null
                } finally {
                    if (!m) m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
                    file = null // releasing the memory
                    return m
                }
            },
            enumerable: true,
            writable: true,
        },
        sendkontak: {
            /**
             * Send Contact
             * @param {String} jid 
             * @param {String[][]|String[]} data
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted 
             * @param {Object} options 
             */
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(Connection.store.getContact(njid)?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
        `.trim()
                    contacts.push({ vcard, displayName: name })

                }
                return await conn.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, { quoted, ...options })
            },
            enumerable: true,
            writable: true,
        },
        /**
             * Send Contact
             * @param {String} jid 
             * @param {String[][]|String[]} data
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted 
             * @param {Object} options 
             */
         sendContact: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
                    let vcard = `
                    BEGIN:VCARD
                    VERSION:3.0
                    N:;${name.replace(/\n/g, '\\n')};;;
                    FN:${name.replace(/\n/g, '\\n')}
                    
                    item1.TEL;waid=${number}:${parsePhoneNumber('+' + number), { regionCode: 'international' }}
                    item1.X-ABLabel:Ponsel${biz.description ? `
                    
                    item2.EMAIL;type=INTERNET:${(biz.email || '').replace(/\n/g, '\\n')}
                    item2.X-ABLabel:Email
                    
                    item3.ADR:;;${(biz.address || '').replace(/\n/g, '\\n')};;;;
                    item3.X-ABLabel:Region
                    
                    item4.URL:${(biz.website)}
                    item4.X-ABLabel:Website
                    
                    X-WA-BIZ-DESCRIPTION:${(biz.description || '').replace(/\n/g, '\\n')}
                    X-WA-BIZ-NAME:${name.replace(/\n/g, '\\n')}
                    ` : ''}
                    END:VCARD
`.trim()
                    contacts.push({ vcard, displayName: name })

                }
                return conn.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, { quoted, ...options })
            },
            enumerable: true
        },
                   /**
     * Send Contact Array
     * @param {String} jid 
     * @param {String} number 
     * @param {String} name 
     * @param {Object} quoted 
     * @param {Object} options 
     */
    sendContactArray: {
        async value(jid, data, quoted, options) {
            if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                    let contacts = []
            for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
                number = number.replace(/[^0-9]/g, '')
                let njid = number + '@s.whatsapp.net'
                let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
                // N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;;
                let vcard = `
    BEGIN:VCARD
    VERSION:3.0
    N:Sy;Bot;;;
    FN:${name.replace(/\n/g, '\\n')}
    item.ORG:${isi}
    item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
    item1.X-ABLabel:${isi1}
    item2.EMAIL;type=INTERNET:${isi2}
    item3.ADR:;;${(biz.address || '').replace(/\n/g, '\\n')};;;;
    item3.X-ABADR:ac
    item3.X-ABLabel:Region
    item4.URL:${(biz.website)}
    item4.X-ABLabel:Website
    item5.X-ABLabel:${isi5}
    END:VCARD`.trim()
                contacts.push({ vcard, displayName: name })
            }
            return conn.sendMessage(jid, {
                contacts: {
                    displayName: (contacts.length > 1 ? `2013 kontak` : contacts[0].displayName) || null,
                    contacts,
                }
            },
            {
                quoted,
                ...options
            })
            }
        },    
         
             /**
    * Send Media All Type 
    * @param {String} jid
    * @param {String|Buffer} path
    * @param {Object} quoted
    * @param {Object} options 
    */
    sendMedia: {
        async value(jid, path, quoted, options = {}) {
            let { ext, mime, data } = await conn.getFile(path)
            let messageType = mime.split("/")[0]
            let pase = messageType.replace('application', 'document') || messageType
            return conn.sendMessage(jid, { [`${pase}`]: data, mimetype: mime, ...options }, { quoted })
        }
        },
        /**
        * Send a list message
        * @param jid the id to send to
        * @param button the optional button text, title and description button
        * @param rows the rows of sections list message
        */
        sendListM: {
        async value(jid, button, rows, quoted, options = {}) {
            const sections = [
                {
                    title: button.title,
                    rows: [...rows]
                }
            ]
            const listMessage = {
                text: button.description,
                footer: button.footerText,
                mentions: await conn.parseMention(button.description),
                ephemeralExpiration: ephemeral,
                title: '',
                buttonText:button.buttonText,
                sections
            }
            conn.sendMessage(jid, listMessage, {
                quoted,
                ephemeralExpiration: '99999999999999',
                contextInfo: {
                    forwardingScore: '99999999999999',
                    isForwarded: true,
                    mentions: await conn.parseMention(button.description + button.footerText),
                    ...options
                }
            })
          }
        },
            /** Resize Image
      *
      * @param {Buffer} Buffer (Only Image)
      * @param {Numeric} Width
      * @param {Numeric} Height
      */
      resize: {
        async value(image, width, height) {
         let oyy = await jimp.read(image)
         let kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
         return kiyomasa
        }
      },
        reply: {
            /**
             * Reply to a message
             * @param {String} jid
             * @param {String|Buffer} text
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            value(jid, text = '', quoted, options) {
                const _uptime = process.uptime() * 1000
                const u = conn.clockString(_uptime)
                return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options,
                text,
                mentions: conn.parseMention(text),
                contextInfo: global.adReply.contextInfo,
                ...options }, {
                    quoted,
                    ephemeralExpiration: ephemeral,
                    ...options
                })
            }
        },
        react: {
            async value(jid, text, key) {
            return conn.sendMessage(jid, { react: { text: text, key: key } })
        }},
/*
        getBusinessProfile:{
        async value(jid)  {
            const results = await conn.query({
                tag: 'iq',
                attrs: {
                    to: 's.whatsapp.net',
                    xmlns: 'w:biz',
                    type: 'get'
                },
                content: [{
                    tag: 'business_profile',
                    attrs: { v: '244' },
                    content: [{
                        tag: 'profile',
                        attrs: { jid }
                    }]
                }]
            })
            const profiles = getBinaryNodeChild(getBinaryNodeChild(results, 'business_profile'), 'profile')
            if (!profiles) return {} // if not bussines
            const address = getBinaryNodeChild(profiles, 'address')
            const description = getBinaryNodeChild(profiles, 'description')
            const website = getBinaryNodeChild(profiles, 'website')
            const email = getBinaryNodeChild(profiles, 'email')
            const category = getBinaryNodeChild(getBinaryNodeChild(profiles, 'categories'), 'category')
            return {
                jid: profiles.attrs?.jid,
                address: address?.content.toString(),
                description: description?.content.toString(),
                website: website?.content.toString(),
                email: email?.content.toString(),
                category: category?.content.toString(),
            }
        }
    },
*/
        //custom wilayah tambah sendiri  
 //sendbuttonimg sama sendbuttloc ubah jadi pake sendbutton aja kek gini
 //
        /** Send Button Gif
         *
         * @param {*} jid
         * @param {*} text
         * @param {*} footer
         * @param {*} Gif
         * @param [*] button
         * @param {*} options
         * @returns
         */
        sendButtonGif: {
        async value(jid , text = '' , footer = '', gif, but = [], buff, options = {}) {
        let file = await conn.resize(buff, 300, 150)
        let a = [1,2]
        let b = a[Math.floor(Math.random() * a.length)]
        conn.sendMessage(jid, { video: gif, gifPlayback: true, gifAttribution: b, caption: text, footer: footer, jpegThumbnail: file, templateButtons: but, ...options })
        }
        },
        /**
        * Send Payment
        */
        sendPayment: {
        async value(jid, amount, currency, text = '', from, image, options) {
        let file = await conn.resize(image, 300, 150)
        let a = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BOV","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHE","CHF","CHW","CLF","CLP","CNY","COP","COU","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MXV","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP","STD","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","USN","USS","UYI","UYU","UZS","VEF","VND","VUV","WST","XAF","XAG","XAU","XBA","XBB","XBC","XBD","XCD","XDR","XFU","XOF","XPD","XPF","XPT","XTS","XXX","YER","ZAR","ZMW"]
        let b = a[Math.floor(Math.random() * a.length)]
        const requestPaymentMessage = { amount: {
                currencyCode: currency || b,
                offset: 0,
                value: amount || 9.99
            },
            expiryTimestamp: 0,
            amount1000: (amount || 9.99) * 1000,
            currencyCodeIso4217: currency || b,
            requestFrom: from || '0@s.whatsapp.net',
            noteMessage: {
                extendedTextMessage: {
                    text: text || 'Example Payment Message'
                }
            },
            background: !!image ? file : undefined
        };
        return conn.relayMessage(jid, { requestPaymentMessage }, { ...options });
    }
    },
    // send sticker img
sendStimg: {
    async value(jid, path, quoted, options = {}){
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
    let buffer
    if (options && (options.packname || options.author)) {
    buffer = await writeExifImg(buff, options)
    } else {
    buffer = await imageToWebp(buff)
    }
    console.log("anu ", buffer)
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
    }
    },
    
    // send sticked video
    sendStvid: {
    async value(jid, path, quoted, options = {}){
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
    
    let buffer
    if (options && (options.packname || options.author)) {
    buffer = await writeExifVid(buff, options)
    } else {
    buffer = await videoToWebp(buff)
    }
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
    }
    },
    hy1: {
    async value(jid, capt, foot, is1, iS1, is2, iS2, btn1, id1) {
    var key = {
    text: capt,
    footer: foot,
    templateButtons: [
    {
    index: 1, urlButton: {
    displayText: is1,
    url: iS1
    }
    },
    {
    index: 2, callButton: {
    displayText: is2,
    phoneNumber: iS2
    }
    },
    {
    index: 3, quickReplyButton: {
    displayText: btn1, id: id1
    }
    },
    ]
    }
    return conn.sendMessage(jid, key)
    }
    },
    /**
        * Send Poll
        */
        sendPoll: {
                async value(jid, name = '', optiPoll, options) {
                    if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll]
                    if (!options) options = {}
                    const pollMessage = {
            name: name,
            options: optiPoll.map(btn => ({
                                optionName: !nullish(btn[0]) && btn[0] || ''
                        })),
                        selectableOptionsCount: 1
            }
                    return conn.relayMessage(jid, { pollCreationMessage: pollMessage }, { ...options });
                    }
            },
            /**
         * send Button Document
         * @param {String} jid 
         * @param {String} contentText 
         * @param {String} footer
         * @param {Buffer|String} buffer 
         * @param {String[]} buttons 
         * @param {Object} quoted 
         * @param {Object} options 
         */
        sendButtonDoc: {
        async value(jid, content, footerText, button1, id1, quoted, options) {
          const buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }
          ]
          const buttonMessage = {
            document: { url: "By" + author },
            mimetype: doc,
            fileName: ucapan,
            fileLength: '99999999999999',
            pageCount: fpdoc,
                jpegThumbnail: thumb,
            caption: content,
            footer: footerText,
            mentions: await conn.parseMention(content + footerText),
            ...options,
            buttons: buttons,
            headerType: 1
          }
          conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: ephemeral, forwardingScore: '99999999999999', isForwarded: true, ...options })
        }},
        /* */
        send2ButtonDoc: {
        async value(jid, content, footerText, button1, id1, button2, id2, quoted, options) {
            const buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
            { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
            ]
            const buttonMessage = {
                document: { url: "By" + author},
                mimetype: doc,
                fileName: ucapan,
                fileLength: '99999999999999',
                pageCount: fpdoc,
                jpegThumbnail: thumb,
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ...options,
                buttons: buttons,
                headerType: 1
            }
            conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: ephemeral, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: '99999999999999', isForwarded: true }, ...options, ephemeralExpiration: ephemeral } )
        }},
        /* */
        send2ButtonImgDoc: {
        async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            const buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
            { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
            ]
    
            const buttonMessage = {
                image: file,
                document: { url: "By" + author},
                mimetype: doc,
                fileName: ucapan,
                fileLength: '99999999999999',
                pageCount: fpdoc,
                jpegThumbnail: thumb,
                fileLength: '99999999999999',
                caption: contentText,
                footer: footerText,
                mentions: await conn.parseMention(contentText + footerText),
                ...options,
                buttons: buttons,
                headerType: 4
            }
    
            return conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: ephemeral, contextInfo: { mentionedJid: conn.parseMention(contentText + footerText) }, ...options })
        }},
    
        /**
         * send Button Vid
         * @param {String} jid 
         * @param {String} contentText 
         * @param {String} footer
         * @param {Buffer|String} buffer
         * @param {String} buttons1
         * @param {String} row1
         * @param {Object} quoted 
         * @param {Object} options 
         */
        sendButtonVid: {
        async value(jid, buffer, contentText, footerText, button1, id1, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            let buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }
            ]
            const buttonMessage = {
                video: file,
                fileLength: '99999999999999',
                caption: contentText,
                footer: footerText,
                mentions: await conn.parseMention(contentText),
                ...options,
                buttons: buttons,
                headerType: 4
            }
            return conn.sendMessage(jid, buttonMessage, {
                quoted,
                ephemeralExpiration: ephemeral,
                ...options
            })
        }},
        /* */
        send2ButtonVid: {
        async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            let buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
            { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
            ]
            const buttonMessage = {
                video: file,
                fileLength: '99999999999999',
                caption: contentText,
                footer: footerText,
                mentions: await conn.parseMention(contentText + footerText),
                ...options,
                buttons: buttons,
                headerType: 4
            }
            return conn.sendMessage(jid, buttonMessage, {
                quoted,
                ephemeralExpiration: ephemeral,
                ...options
            })
        }},
        /* */
        send3ButtonVid: {
        async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, button3, id3, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            let buttons = [
            { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
            { buttonId: id2, buttonText: { displayText: button2 }, type: 1 },
            { buttonId: id3, buttonText: { displayText: button3 }, type: 1 },
            ]
            const buttonMessage = {
                video: file,
                fileLength: '99999999999999',
                caption: contentText,
                footer: footerText,
                mentions: await conn.parseMention(contentText + footerText),
                ...options,
                buttons: buttons,
                headerType: 4
            }
            return conn.sendMessage(jid, buttonMessage, {
                quoted,
                ephemeralExpiration: ephemeral,
                ...options
            })
        }},
        /* */
    
        //========== Template Here ==========// 
    
        /**
        * send Template Button
        * @param {String} jid 
        * @param {String} contentText 
        * @param {String} footer
        * @param {String} buttons
        * @param {String} row
        * @param {Object} quoted 
        */
        send3TemplateButtonImg: {
        async value(jid, buffer, content, footerText, button1, id1, button2, id2, button3, id3, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            const buttons = [
                { index: 1, urlButton: { displayText: '⫹⫺ Web', url: web } },
                { index: 2, quickReplyButton: { displayText: button1, id: id1 } },
                { index: 3, quickReplyButton: { displayText: button2, id: id2 } },
                { index: 4, quickReplyButton: { displayText: button3, id: id3 } }
            ]
            const buttonMessage = {
                image: file,
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ephemeralExpiration: ephemeral,
                ...options,
                templateButtons: buttons,
                headerType: 1
            }
            conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: ephemeral, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: '99999999999999', isForwarded: true }, ...options, ephemeralExpiration: ephemeral } )
        }},
        /* */
        sendTemplateButtonDoc: {
        async value(jid, buffer, content, footerText, button1, id1, quoted, options) {
            const buttons = [
                { index: 1, urlButton: { displayText: '⫹⫺ Web', url: web } },
                { index: 2, callButton: { displayText: '⫹⫺ ᴏᴡɴᴇʀ',  phoneNumber: author } },
                { index: 3, quickReplyButton: { displayText: button1, id: id1 } },
            ]
            const buttonMessage = {
                document: { url: "By" + author},
                mimetype: doc,
                fileName: ucapan,
                fileLength: '99999999999999',
                pageCount: fpdoc,
                jpegThumbnail: thumb,
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ...options,
                templateButtons: buttons,
                headerType: 1
            }
            conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: ephemeral, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: '99999999999999', isForwarded: true }, ...options, ephemeralExpiration: ephemeral } )
        }},
        /* */
        sendTemplateButtonLoc: {
        async value(jid, buffer, contentText, footer, buttons1, row1, quoted, options) {
            let file = await conn.resize(buffer, 300, 150)
        const template = generateWAMessageFromContent(jid, proto.Message.fromObject({
          templateMessage: {
            hydratedTemplate: {
              locationMessage: { jpegThumbnail: file },
              hydratedContentText: contentText,
              hydratedFooterText: footer,
              ...options,
              hydratedButtons: [{
                urlButton: {
                  displayText: author,
                  url: web
                }
              },
              {
                quickReplyButton: {
                  displayText: buttons1,
                  id: row1
                }
              }]
            }
          }
        }), { userJid: conn.user.jid, quoted: quoted, contextInfo: { mentionedJid: conn.parseMention(contentText + footer) }, ephemeralExpiration: ephemeral, ...options });
        return conn.relayMessage(
          jid,
          template.message,
          { messageId: template.key.id }
        )
      }},
        /* */
        sendTemplateButtonFakeImg: {
        async value(jid, buffer, content, footerText, btn1, id1, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            const key = {
                video: file,
                jpegThumbnail: file,
                fileLength: '99999999999999',
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ...options,
                templateButtons: [
                { index: 1, urlButton: { displayText: '⫹⫺ Web', url: web } },
                { index: 2, callButton: { displayText: '⫹⫺ ᴏᴡɴᴇʀ',  phoneNumber: author } },
                { index: 3, quickReplyButton: { displayText: btn1, id: id1 } },
                ],
                ...options
            }
            conn.sendMessage(jid, key, { ephemeralExpiration: ephemeral, mentions: conn.parseMention(content + footerText), contextInfo: { forwardingScore: '99999999999999', isForwarded: true }, ...options })
        }},
        /* */
        send2TemplateButtonFakeImg: {
        async value(jid, buffer, content, footerText, btn1, id1, btn2, id2, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            const key = {
                video: file,
                jpegThumbnail: file,
                fileLength: '99999999999999',
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ...options,
                templateButtons: [
                { index: 1, urlButton: { displayText: '⫹⫺ Web', url: web } },
                { index: 2, callButton: { displayText: '⫹⫺ ᴏᴡɴᴇʀ',  phoneNumber: author } },
                { index: 3, quickReplyButton: { displayText: btn1, id: id1 } },
                { index: 4, quickReplyButton: { displayText: btn2, id: id2 } },
                ]
            }
            conn.sendMessage(jid, key, { quoted, ephemeralExpiration: ephemeral, contextInfo: { mentions: conn.parseMention(content + footerText), forwardingScore: '99999999999999', isForwarded: true } })
        }},
        /* */
        send3TemplateButtonFakeImg: {
        async value(jid, buffer, content, footerText, btn1, id1, btn2, id2, btn3, id3, quoted, options) {
            let type = await conn.getFile(buffer)
            let { res, data: file } = type
            if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
            }
            const key = {
                video: file,
                jpegThumbnail: file,
                fileLength: '99999999999999',
                caption: content,
                footer: footerText,
                mentions: await conn.parseMention(content + footerText),
                ...options,
                templateButtons: [
                { index: 1, urlButton: { displayText: '⫹⫺ Web', url: web } },
                { index: 2, callButton: { displayText: '⫹⫺ ᴏᴡɴᴇʀ',  phoneNumber: author } },
                { index: 3, quickReplyButton: { displayText: btn1, id: id1 } },
                { index: 4, quickReplyButton: { displayText: btn2, id: id2 } },
                { index: 5, quickReplyButton: { displayText: btn3, id: id3 } }
                ]
            }
            conn.sendMessage(jid, key, { quoted, ephemeralExpiration: ephemeral, contextInfo: { forwardingScore: '99999999999999', isForwarded: true, mentions: conn.parseMention(content) } })
        }},
        // TODO: Fix sendLocation
        // Maybe aploud buffer to whatsapp first and then send location
        ///////////////////default//////////////////////////
        sendButton: {
            /**
             * send Button
             * @param {String} jid
             * @param {String} text
             * @param {String} footer
             * @param {Buffer} buffer
             * @param {String[] | String[][]} buttons
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            async value(jid, text = '', footer = '', buffer, buttons, quoted, options) {
                let type
                if (Array.isArray(buffer)) (options = quoted, quoted = buttons, buttons = buffer, buffer = null)
                else if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = null }
                if (!Array.isArray(buttons[0]) && typeof buttons[0] === 'string') buttons = [buttons]
                if (!options) options = {}
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    buttons: buttons.map(btn => ({
                        buttonId: !nullish(btn[1]) && btn[1] || !nullish(btn[0]) && btn[0] || '',
                        buttonText: {
                            displayText: !nullish(btn[0]) && btn[0] || !nullish(btn[1]) && btn[1] || ''
                        }
                    })),
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                }

                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true,
            writable: true,
        },
        sendHydrated: {
            /**
             * 
             * @param {String} jid 
             * @param {String} text 
             * @param {String} footer 
             * @param {fs.PathLike} buffer
             * @param {String|string[]} url
             * @param {String|string[]} urlText
             * @param {String|string[]} call
             * @param {String|string[]} callText
             * @param {String[][]} buttons
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options) {
                let type
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null)
                if (!options) options = {}
                let templateButtons = []
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url]
                    if (!Array.isArray(urlText)) urlText = [urlText]
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ))
                }
                if (call || callText) {
                    if (!Array.isArray(call)) call = [call]
                    if (!Array.isArray(callText)) callText = [callText]
                    templateButtons.push(...(
                        call.map((v, i) => [v, callText[i]])
                            .map(([call, callText], i) => ({
                                index: templateButtons.length + i + 1,
                                callButton: {
                                    displayText: !nullish(callText) && callText || !nullish(call) && call || '',
                                    phoneNumber: !nullish(call) && call || !nullish(callText) && callText || ''
                                }
                            })) || []
                    ))
                }
                if (buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons]
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ))
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                }
                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true,
            writable: true,
        },
        sendHydrated2: {
            /**
             * 
             * @param {String} jid 
             * @param {String} text 
             * @param {String} footer 
             * @param {fs.PathLike} buffer
             * @param {String|string[]} url
             * @param {String|string[]} urlText
             * @param {String|string[]} call
             * @param {String|string[]} callText
             * @param {String[][]} buttons
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            async value(jid, text = '', footer = '', buffer, url, urlText, url2, urlText2, buttons, quoted, options) {
                let type
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null)
                if (!options) options = {}
                let templateButtons = []
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url]
                    if (!Array.isArray(urlText)) urlText = [urlText]
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ))
                }
                if (url2 || urlText2) {
                    if (!Array.isArray(url2)) url2 = [url2]
                    if (!Array.isArray(urlText2)) urlText2 = [urlText2]
                    templateButtons.push(...(
                        url2.map((v, i) => [v, urlText2[i]])
                            .map(([url2, urlText2], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText2) && urlText2 || !nullish(url2) && url2 || '',
                                    url: !nullish(url2) && url2 || !nullish(urlText2) && urlText2 || ''
                                }
                            })) || []
                    ))
                }
                if (buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons]
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ))
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: {
                                ...options,
                                jpegThumbnail: buffer
                            }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                }
                return conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true
        },
        sendList: {
            async value(jid, title, text, footer, buttonText, buffer, listSections, quoted, options) {
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = listSections, listSections = buffer, buffer = null)
                if (!options) options = {}
                // send a list message!
                const sections = listSections.map(([title, rows]) => ({
                    title: !nullish(title) && title || !nullish(rowTitle) && rowTitle || '',
                    rows: rows.map(([rowTitle, rowId, description]) => ({
                        title: !nullish(rowTitle) && rowTitle || !nullish(rowId) && rowId || '',
                        rowId: !nullish(rowId) && rowId || !nullish(rowTitle) && rowTitle || '',
                        description: !nullish(description) && description || ''
                    }))
                }))

                const listMessage = {
                    text,
                    footer,
                    title,
                    buttonText,
                    sections
                }
                return await conn.sendMessage(jid, listMessage, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            }
        },
        //gausah pake ini guys gpake juga udh work
        /*
        updateProfilePicture
        
        updateProfileStatus: {
            async value(status) {
                    return conn.query({
                        tag: 'iq',
                        attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'status',
                            },
                        content: [
                        {
                        tag: 'status',
                        attrs: {},
                        content: Buffer.from(status, 'utf-8')
                        }
                    ]
                })
            }
        },
        */
        cMod: {
            /**
             * cMod
             * @param {String} jid 
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message 
             * @param {String} text 
             * @param {String} sender 
             * @param {*} options 
             * @returns 
             */
            value(jid, message, text = '', sender = conn.user.jid, options = {}) {
                if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions]
                let copy = message.toJSON()
                delete copy.message.messageContextInfo
                delete copy.message.senderKeyDistributionMessage
                let mtype = Object.keys(copy.message)[0]
                let msg = copy.message
                let content = msg[mtype]
                if (typeof content === 'string') msg[mtype] = text || content
                else if (content.caption) content.caption = text || content.caption
                else if (content.text) content.text = text || content.text
                if (typeof content !== 'string') {
                    msg[mtype] = { ...content, ...options }
                    msg[mtype].contextInfo = {
                        ...(content.contextInfo || {}),
                        mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
                    }
                }
                if (copy.participant) sender = copy.participant = sender || copy.participant
                else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
                if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
                else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
                copy.key.remoteJid = jid
                copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false
                return proto.WebMessageInfo.fromObject(copy)
            },
            enumerable: true,
            writable: true,
        },
        copyNForward: {
            /**
             * Exact Copy Forward
             * @param {String} jid
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message
             * @param {Boolean|Number} forwardingScore
             * @param {Object} options
             */
            async value(jid, message, forwardingScore = true, options = {}) {
                let vtype
                if (options.readViewOnce && message.message.viewOnceMessage?.message) {
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                    delete message.message.viewOnceMessage.message[vtype].viewOnce
                    message.message = proto.Message.fromObject(
                        JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
                    )
                    message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
                }
                let mtype = getContentType(message.message)
                let m = generateForwardMessageContent(message, !!forwardingScore)
                let ctype = getContentType(m)
                if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
                m[ctype].contextInfo = {
                    ...(message.message[mtype].contextInfo || {}),
                    ...(m[ctype].contextInfo || {})
                }
                m = generateWAMessageFromContent(jid, m, {
                    ...options,
                    userJid: conn.user.jid
                })
                await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
                return m
            },
            enumerable: true,
            writable: true,
        },
        fakeReply: {
            /**
             * Fake Replies
             * @param {String} jid
             * @param {String|Object} text
             * @param {String} fakeJid
             * @param {String} fakeText
             * @param {String} fakeGroupJid
             * @param {String} options
             */
            value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
                return conn.reply(jid, text, { key: { fromMe: areJidsSameUser(fakeJid, conn.user.id), participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options })
            },
            writable: true,
        },
        downloadM: {
            /**
             * Download media message
             * @param {Object} m
             * @param {String} type
             * @param {fs.PathLike | fs.promises.FileHandle} saveToFile
             * @returns {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>}
             */
            async value(m, type, saveToFile) {
                let filename
                if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
                const stream = await downloadContentFromMessage(m, type)
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                if (saveToFile) ({ filename } = await conn.getFile(buffer, true))
                return saveToFile && fs.existsSync(filename) ? filename : buffer
            },
            enumerable: true,
            writable: true,
        },
        parseMention: {
            /**
             * Parses string into mentionedJid(s)
             * @param {String} text
             * @returns {Array<String>}
             */
            value(text = '') {
                return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
            },
            enumerable: true,
            writable: true,
        },
        getName: {
            /**
             * Get name from jid
             * @param {String} jid
             * @param {Boolean} withoutContact
             */
            value(jid = '', withoutContact = false) {
                jid = conn.decodeJid(jid)
                withoutContact = conn.withoutContact || withoutContact
                let v
                if (jid.endsWith('@g.us')) return (async () => {
                    v = await Connection.store.fetchGroupMetadata(jid, conn.groupMetadata) || {}
                    return (v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
                })()

                else v = jid === '0@s.whatsapp.net' ? {
                    jid,
                    vname: 'WhatsApp'
                } : areJidsSameUser(jid, conn.user?.id || '') ?
                    conn.user :
                    (Connection.store.getContact(jid) || {})
                return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
            },
            enumerable: true,
            writable: true,
        },
        loadMessage: {
            /**
             * 
             * @param {String} messageID 
             * @returns {import('@adiwajshing/baileys').proto.WebMessageInfo}
             */
            value(jid, id) {
                if (!jid && !id) return null
                // if only 1 argument is passed, it is assumed to be a message id not a jid
                if (jid && !id) [id, jid] = [jid, null]
                return jid && id ? Connection.store.loadMessage(jid, id) : Connection.store.loadMessage(id)
            },
            enumerable: true,
            writable: true,
        },
        // TODO: Fix xml-notwell-format
        sendGroupV4Invite: {
            /**
             * sendGroupV4Invite
             * @param {String} jid 
             * @param {*} participant 
             * @param {String} inviteCode 
             * @param {Number} inviteExpiration 
             * @param {String} groupName 
             * @param {String} caption 
             * @param {Buffer} jpegThumbnail
             * @param {*} options 
             */
            async value(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
                const msg = proto.Message.fromObject({
                    groupInviteMessage: proto.GroupInviteMessage.fromObject({
                        inviteCode,
                        inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
                        groupJid: jid,
                        groupName: (groupName ? groupName : await conn.getName(jid)) || null,
                        jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail.toString('base64') : null,
                        caption
                    })
                })
                const message = generateWAMessageFromContent(participant, msg, options)
                await conn.relayMessage(participant, message.message, { messageId: message.key.id, additionalAttributes: { ...options } })
                return message
            },
            enumerable: true,
            writable: true,
        },
        /**
         * By Fokus ID
         * @param {*} message 
         * @param {*} filename 
         * @param {*} attachExtension 
         * @returns 
         */
        downloadAndSaveMediaMessage: {
            async value(message, filename, attachExtension = true) {
                let quoted = message.msg ? message.msg : message
                let mime = (message.msg || message).mimetype || ''
                let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
                const stream = await downloadContentFromMessage(quoted, messageType)
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
                }
                let type = await FileType.fromBuffer(buffer)
                trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
                // save to file
                await fs.writeFileSync(trueFileName, buffer)
                return trueFileName
            }
        },
        processMessageStubType: {
            /**
             * to process MessageStubType
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
             */
            async value(m) {
                if (!m.messageStubType) return
                const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
                if (!chat || chat === 'status@broadcast') return
                const emitGroupUpdate = (update) => {
                    ev.emit('groups.update', [{ id: chat, ...update }])
                }
                switch (m.messageStubType) {
                    case WAMessageStubType.REVOKE:
                    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                        emitGroupUpdate({ revoke: m.messageStubParameters[0] })
                        break
                    case WAMessageStubType.GROUP_CHANGE_ICON:
                        emitGroupUpdate({ icon: m.messageStubParameters[0] })
                        break
                    default: {
                        console.log({
                            messageStubType: m.messageStubType,
                            messageStubParameters: m.messageStubParameters,
                            type: WAMessageStubType[m.messageStubType]
                        })
                        break
                    }
                }
                const isGroup = chat.endsWith('@g.us')
                if (!isGroup) return
                let chats = conn.chats[chat]
                if (!chats) chats = conn.chats[chat] = { id: chat }
                chats.isChats = true
                const metadata = await conn.groupMetadata(chat).catch(_ => null)
                if (!metadata) return
                chats.subject = metadata.subject
                chats.metadata = metadata
            }
        },
        insertAllGroup: {
            async value() {
                const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {}
                for (const group in groups) conn.chats[group] = { ...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
                return conn.chats
            },
        },
        pushMessage: {
            /**
             * pushMessage
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo[]} m 
             */
            async value(m) {
                if (!m) return
                if (!Array.isArray(m)) m = [m]
                for (const message of m) {
                    try {
                        // if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f
                        if (!message) continue
                        if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error)
                        const _mtype = Object.keys(message.message || {})
                        const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                            (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                            _mtype[_mtype.length - 1]
                        const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
                        if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                            /**
                             * @type {import('@adiwajshing/baileys').proto.IContextInfo}
                             */
                            let context = message.message[mtype].contextInfo
                            let participant = conn.decodeJid(context.participant)
                            const remoteJid = conn.decodeJid(context.remoteJid || participant)
                            /**
                             * @type {import('@adiwajshing/baileys').proto.IMessage}
                             * 
                             */
                            let quoted = message.message[mtype].contextInfo.quotedMessage
                            if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                                let qMtype = Object.keys(quoted)[0]
                                if (qMtype == 'conversation') {
                                    quoted.extendedTextMessage = { text: quoted[qMtype] }
                                    delete quoted.conversation
                                    qMtype = 'extendedTextMessage'
                                }
                                if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
                                quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
                                const isGroup = remoteJid.endsWith('g.us')
                                if (isGroup && !participant) participant = remoteJid
                                const qM = {
                                    key: {
                                        remoteJid,
                                        fromMe: areJidsSameUser(conn.user.jid, remoteJid),
                                        id: context.stanzaId,
                                        participant,
                                    },
                                    message: JSON.parse(JSON.stringify(quoted)),
                                    ...(isGroup ? { participant } : {})
                                }
                                let qChats = conn.chats[participant]
                                if (!qChats) qChats = conn.chats[participant] = { id: participant, isChats: !isGroup }
                                if (!qChats.messages) qChats.messages = {}
                                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
                                let qChatsMessages
                                if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) // maybe avoid memory leak
                            }
                        }
                        if (!chat || chat === 'status@broadcast') continue
                        const isGroup = chat.endsWith('@g.us')
                        let chats = conn.chats[chat]
                        if (!chats) {
                            if (isGroup) await conn.insertAllGroup().catch(console.error)
                            chats = conn.chats[chat] = { id: chat, isChats: true, ...(conn.chats[chat] || {}) }
                        }
                        let metadata, sender
                        if (isGroup) {
                            if (!chats.subject || !chats.metadata) {
                                metadata = await conn.groupMetadata(chat).catch(_ => ({})) || {}
                                if (!chats.subject) chats.subject = metadata.subject || ''
                                if (!chats.metadata) chats.metadata = metadata
                            }
                            sender = conn.decodeJid(message.key?.fromMe && conn.user.id || message.participant || message.key?.participant || chat || '')
                            if (sender !== chat) {
                                let chats = conn.chats[sender]
                                if (!chats) chats = conn.chats[sender] = { id: sender }
                                if (!chats.name) chats.name = message.pushName || chats.name || ''
                            }
                        } else if (!chats.name) chats.name = message.pushName || chats.name || ''
                        if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
                        chats.isChats = true
                        if (!chats.messages) chats.messages = {}
                        const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id)
                        if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                            delete message.message.messageContextInfo
                            delete message.message.senderKeyDistributionMessage
                            chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
                            let chatsMessages
                            if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        },
     /**
     * ms to date
     * @param {String} ms
     */
    msToDate: {
    async value(ms)  {
        let days = Math.floor(ms / (24 * 60 * 60 * 1000));
        let daysms = ms % (24 * 60 * 60 * 1000);
        let hours = Math.floor((daysms) / (60 * 60 * 1000));
        let hoursms = ms % (60 * 60 * 1000);
        let minutes = Math.floor((hoursms) / (60 * 1000));
        let minutesms = ms % (60 * 1000);
        let sec = Math.floor((minutesms) / (1000));
        return days + " Hari " + hours + " Jam " + minutes + " Menit";
        // +minutes+":"+sec;
      }
    },
      /** 
      * Translate Text 
      * @param {String} code
      * @param {String|Buffer} text
      */
    translate: {
        async value(code, text) {
            return await translate(text, { from: 'id', to: code }).catch(async _=> await translate2(text, { from: 'id', to: code }))
          }
        },

      /**
       * merge arrays
       * @param {Array} arr
       */
      join:{
      async value (arr)  {
          let construct = []
          for (let i = 0; i < arr.length; i++) {
              construct = construct.concat(arr[i])
          }
          return construct
      }},
  
      /**
       * 
       * @param {Array} list 
       * @returns 
       */
      pickRandom: {
      async value (list)  {
          return list[Math.floor(list.length * Math.random())]
      }},
  
      /**
       * 
       * @param {Number} ms 
       * @returns 
       */
      delay: {
      async value(ms) {
          return new Promise((resolve, reject) => setTimeout(resolve, ms))
      }},

      /**
       * 
       * @param {String} text 
       * @returns 
       */
      filter:{
      async value(text)  {
        let mati = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"]
        if (/[aiueo][aiueo]([qwrtypsdfghjklzxcvbnm])?$/i.test(text)) return text.substring(text.length - 1)
        else {
          let res = Array.from(text).filter(v => mati.includes(v))
          let resu = res[res.length - 1]
          for (let huruf of mati) {
              if (text.endsWith(huruf)) {
                  resu = res[res.length - 2]
              }
          }
          let misah = text.split(resu)
          return resu + misah[misah.length - 1]
        }
      }
    },
  
      /**
       * 
       * @param  {...any} args 
       * @returns 
       */
      format: {
      async value(...args)  {
          return util.format(...args)
      }},
  
      /**
       * 
       * @param {String} url 
       * @param {Object} options 
       * @returns 
       */
      getBuffer: { 
      async value(url, options)  {
          try {
              options ? options : {}
              const res = await axios({
                  method: "get",
                  url,
                  headers: {
                      'DNT': 1,
                      'Upgrade-Insecure-Request': 1
                  },
                  ...options,
                  responseType: 'arraybuffer'
              })
              return res.data
          } catch (e) {
              console.log(`Error : ${e}`)
          }
      }},
            /**
     * 
     * @param {Number} ms 
     * @returns 
     */
    clockString: {
    async value(ms) {
        let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
        let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
        let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }},
                /** Profile Image
      *
      * @param {Buffer} Buffer (Only Image)
      * @param {Numeric} Width
      * @param {Numeric} Height
      */
                 generateProfilePicture: {
                    async value(buffer = {}) {
                    const jimp_1 = await jimp.read(buffer);
                    const resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, jimp.AUTO) : jimp_1.resize(jimp.AUTO, 650)
                    const jimp_2 = await jimp.read(await resz.getBufferAsync(jimp.MIME_JPEG));
                    return {
                      img: await resz.getBufferAsync(jimp.MIME_JPEG)
                    }}
                    },
        serializeM: {
            /**
             * Serialize Message, so it easier to manipulate
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m
             */
            value(m) {
                return smsg(conn, m)
            },
            writable: true,
        },
        ...(typeof conn.setStatus !== 'function' ? {
            setStatus: {
                /**
                 * setStatus bot
                 * @param {String} status 
                 */
                value(status) {
                    return conn.query({
                        tag: 'iq',
                        attrs: {
                            to: S_WHATSAPP_NET,
                            type: 'set',
                            xmlns: 'status',
                        },
                        content: [
                            {
                                tag: 'status',
                                attrs: {},
                                content: Buffer.from(status, 'utf-8')
                            }
                        ]
                    })
                },
                enumerable: true,
                writable: true,
            }
        } : {}),
        user: {
            get() {
                Object.assign(botUser, conn.authState.creds.me || {})
                return {
                    ...botUser,
                    jid: botUser.id?.decodeJid?.() || botUser.id,
                }
            },
            set(value) {
                Object.assign(botUser, value)
            },
            enumerable: true,
            configurable: true,
        }
    })

    return sock
}
/**
 * Serialize Message
 * @param {ReturnType<typeof makeWASocket>} conn 
 * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
 * @param {Boolean} hasParent 
 */
export function smsg(conn, m, hasParent) {
    if (!m) return m
    /**
     * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
     */
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    Object.defineProperty(m, 'conn', { enumerable: false, writable: true, value: conn })
    let protocolMessageKey
    if (m.message) {
        if (m.mtype == 'protocolMessage' && m.msg.key) {
            protocolMessageKey = m.msg.key
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
            protocolMessageKey.fromMe = areJidsSameUser(protocolMessageKey.participant, conn.user.id)
            if (!protocolMessageKey.fromMe && areJidsSameUser(protocolMessageKey.remoteJid, conn.user.id)) protocolMessageKey.remoteJid = m.sender
        }
        if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download
    }
    if (!m.mediaMessage) delete m.download

    try {
        if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('messages.delete', { keys: [protocolMessageKey] })
    } catch (e) {
        console.error(e)
    }
    return m
}

// https://github.com/Nurutomo/wabot-aq/issues/490
export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: global.conn,
            enumerable: false,
            writable: true
        },
        id: {
            get() {
                return this.key?.id
            }
        },
        isBaileys: {
            get() {
                return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id?.length === 12 || false
            }
        },
        chat: {
            get() {
                const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
                return (
                    this.key?.remoteJid ||
                    (senderKeyDistributionMessage &&
                        senderKeyDistributionMessage !== 'status@broadcast'
                    ) || ''
                ).decodeJid()
            }
        },
        isGroup: {
            get() {
                return this.chat.endsWith('@g.us')
            },
            enumerable: true
        },
        sender: {
            get() {
                return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '')
            },
            enumerable: true
        },
        fromMe: {
            get() {
                return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false
            }
        },
        mtype: {
            get() {
                if (!this.message) return ''
                return getContentType(this.message)
            },
            enumerable: true
        },
        msg: {
            get() {
                if (!this.message) return null
                return this.message[this.mtype]
            }
        },
        mediaMessage: {
            get() {
                if (!this.message) return null
                const Message = ((this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessageContent(this.message)) || null
                if (!Message) return null
                const mtype = Object.keys(Message)[0]
                return MediaType.includes(mtype) ? Message : null
            },
            enumerable: true
        },
        mediaType: {
            get() {
                let message
                if (!(message = this.mediaMessage)) return null
                return Object.keys(message)[0]
            },
            enumerable: true,
        },
        quoted: {
            get() {
                /** @type {ReturnType<typeof makeWASocket>} */
                const self = this
                const msg = self.msg
                const contextInfo = msg?.contextInfo
                const quoted = contextInfo?.quotedMessage
                if (!msg || !contextInfo || !quoted) return null
                const type = getContentType(quoted)
                let q = quoted[type]
                const text = typeof q === 'string' ? q : q.text
                return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
                    mtype: {
                        get() {
                            return type
                        },
                        enumerable: true
                    },
                    mediaMessage: {
                        get() {
                            const Message = ((q.url || q.directPath) ? { ...quoted } : extractMessageContent(quoted)) || null
                            if (!Message) return null
                            const mtype = Object.keys(Message)[0]
                            return MediaType.includes(mtype) ? Message : null
                        },
                        enumerable: true
                    },
                    mediaType: {
                        get() {
                            let message
                            if (!(message = this.mediaMessage)) return null
                            return Object.keys(message)[0]
                        },
                        enumerable: true,
                    },
                    id: {
                        get() {
                            return contextInfo.stanzaId
                        },
                        enumerable: true
                    },
                    chat: {
                        get() {
                            return contextInfo.remoteJid || self.chat
                        },
                        enumerable: true
                    },
                    isBaileys: {
                        get() {
                            return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id.length === 12 || false
                        },
                        enumerable: true
                    },
                    sender: {
                        get() {
                            return (contextInfo.participant || this.chat || '').decodeJid()
                        },
                        enumerable: true
                    },
                    fromMe: {
                        get() {
                            return areJidsSameUser(this.sender, self.conn?.user.jid)
                        },
                        enumerable: true,
                    },
                    text: {
                        get() {
                            return text || this.caption || this.contentText || this.selectedDisplayText || ''
                        },
                        enumerable: true
                    },
                    mentionedJid: {
                        get() {
                            return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
                        },
                        enumerable: true
                    },
                    name: {
                        get() {
                            const sender = this.sender
                            return sender ? self.conn?.getName(sender) : null
                        },
                        enumerable: true

                    },
                    vM: {
                        get() {
                            return proto.WebMessageInfo.fromObject({
                                key: {
                                    fromMe: this.fromMe,
                                    remoteJid: this.chat,
                                    id: this.id
                                },
                                message: quoted,
                                ...(self.isGroup ? { participant: this.sender } : {})
                            })
                        }
                    },
                    fakeObj: {
                        get() {
                            return this.vM
                        }
                    },
                    download: {
                        value(saveToFile = false) {
                            const mtype = this.mediaType
                            return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
                        },
                        enumerable: true,
                        configurable: true,
                    },
                    reply: {
                        /**
                         * Reply to quoted message
                         * @param {String|Object} text
                         * @param {String|false} chatId
                         * @param {Object} options
                         */
                        value(text, chatId, options) {
                            return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options)
                        },
                        enumerable: true,
                    },
                    copy: {
                        /**
                         * Copy quoted message
                         */
                        value() {
                            const M = proto.WebMessageInfo
                            return smsg(conn, M.fromObject(M.toObject(this.vM)))
                        },
                        enumerable: true,
                    },
                    forward: {
                        /**
                         * Forward quoted message
                         * @param {String} jid
                         *  @param {Boolean} forceForward
                         */
                        value(jid, force = false, options) {
                            return self.conn?.sendMessage(jid, {
                                forward: this.vM, force, ...options
                            }, { ...options })
                        },
                        enumerable: true,
                    },
                    copyNForward: {
                        /**
                         * Exact Forward quoted message
                         * @param {String} jid
                         * @param {Boolean|Number} forceForward
                         * @param {Object} options
                         */
                        value(jid, forceForward = false, options) {
                            return self.conn?.copyNForward(jid, this.vM, forceForward, options)
                        },
                        enumerable: true,

                    },
                    cMod: {
                        /**
                         * Modify quoted Message
                         * @param {String} jid
                         * @param {String} text
                         * @param {String} sender
                         * @param {Object} options
                         */
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options)
                        },
                        enumerable: true,

                    },
                    delete: {
                        /**
                         * Delete quoted message
                         */
                        value() {
                            return self.conn?.sendMessage(this.chat, { delete: this.vM.key })
                        },
                        enumerable: true,

                    },
                    react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: {
                                    text,
                                    key: this.vM.key
                                }
                            })
                        },
                        enumerable: true,
                    }
                })
            },
            enumerable: true
        },
        _text: {
            value: null,
            writable: true,
        },
        text: {
            get() {
                const msg = this.msg
                const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
                return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
                    text?.selectedDisplayText ||
                    text?.hydratedTemplate?.hydratedContentText ||
                    text
                )) || ''
            },
            set(str) {
                return this._text = str
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                return this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || []
            },
            enumerable: true
        },
        name: {
            get() {
                return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            value(text, chatId, options) {
                return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo
                return smsg(this.conn, M.fromObject(M.toObject(this)))
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(jid, {
                    forward: this, force, ...options
                }, { ...options })
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options)
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options)
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null
                const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.sender, this.quoted.id) || this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
                return smsg(this.conn, q)
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, { delete: this.key })
            },
            enumerable: true
        },
        react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                })
            },
            enumerable: true
        }
    })
}

export function logic(check, inp, out) {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    }
    /**
     * @returns {ArrayBuffer}
     */
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
    }
    /**
     * @returns {Buffer}
     */
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this))
    }
    // /**
    //  * @returns {String}
    //  */
    // Buffer.prototype.toUtilFormat = ArrayBuffer.prototype.toUtilFormat = Object.prototype.toUtilFormat = Array.prototype.toUtilFormat = function toUtilFormat() {
    //     return util.format(this)
    // }
    Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
        return await fileTypeFromBuffer(this)
    }
    /**
     * @returns {Boolean}
     */
    String.prototype.isNumber = Number.prototype.isNumber = isNumber
    /**
     * 
     * @returns {String}
     */
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length)
    }
    /**
     * @returns {String}
     */
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(' ')
        return str.map(v => v.capitalize()).join(' ')
    }
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
        } else return this.trim()
    }
    /**
     * number must be milliseconds
     * @returns {string}
     */
    Number.prototype.toTimeString = function toTimeString() {
        // const milliseconds = this % 1000
        const seconds = Math.floor((this / 1000) % 60)
        const minutes = Math.floor((this / (60 * 1000)) % 60)
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
        const days = Math.floor((this / (24 * 60 * 60 * 1000)))
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim()
    }
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}

function isNumber() {
    const int = parseInt(this)
    return typeof int === 'number' && !isNaN(int)
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
    return Math.floor(Math.random() * this)
}

/**
 * ??
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 * @returns {boolean}
 */
function nullish(args) {
    return !(args !== null && args !== undefined)
}

