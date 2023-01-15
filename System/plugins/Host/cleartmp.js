const { __dirname } = (await import('../../lib/helper.js')).default 
import { promises as fs } from 'fs'
import { tmpdir, platform } from 'os'
import { join } from 'path'

const TIME = 1000 * 60 * 3
const __dirname1 = __dirname(import.meta)
let handler = async (m, { conn, usedPrefix: _p, dirname, args }) => { //dirnamme

const tmp = [tmpdir(), join(__dirname1, '../../../tmp')]
const filename = []

await Promise.allSettled(tmp.map(async (dir) => {
    const files = await fs.readdir(dir)
    for (const file of files) filename.push(join(dir, file))
}))

return await Promise.allSettled(filename.map(async (file) => {
    const stat = await fs.stat(file)
    if (stat.isFile() && (Date.now() - stat.mtimeMs >= TIME)) {
        // https://stackoverflow.com/questions/28588707/node-js-check-if-a-file-is-open-before-copy
        if (platform() === 'win32') {
            // https://github.com/nodejs/node/issues/20548
            // https://nodejs.org/api/fs.html#filehandleclose
            let fileHandle
            try {
                fileHandle = await fs.open(file, 'r+')
            } catch (e) {
                console.error('[clearTmp]', e, 'Skipping', file)
                return e
            } finally {
                await fileHandle?.close()
            }
        }
        await fs.unlink(file)  
        await conn.reply(m.chat, 'Succes !', m)
    }
}
)
)
}
handler.help = ['cleartmp']
handler.tags = ['owner', 'host']
handler.command = /^(cleartmp)$/i

handler.rowner = true

export default handler