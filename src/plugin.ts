import { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Mod1 } from './types'

export default class CanvasServer implements PluginClass {
    static dir: string
    static mod: Mod1

    constructor(mod: Mod1) {
        CanvasServer.dir = mod.baseDirectory
        CanvasServer.mod = mod
        CanvasServer.mod.isCCL3 = mod.findAllAssets ? true : false
        CanvasServer.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }
    async prestart() {}
    async poststart() {
        run()
    }
}

import http from 'http'
const ws: typeof import('ws') = window.require('ws')
import type { WebSocket } from 'ws'

import htmlBase from './index.html'

function run() {
    const wsPort = 8080
    const cw = 568
    const ch = 320

    const wss = new ws.Server({ port: wsPort })
    const clients: WebSocket[] = []
    wss.on('connection', ws => {
        clients.push(ws)

        ws.send('Welcome to the WebSocket server!')
        ws.on('message', message => {
            console.log(`Received: ${message}`)
            ws.send(`You said: ${message}`)
        })

        ws.on('close', () => {
            clients.erase(ws)
        })
    })

    ig.Game.inject({
        finalDraw() {
            this.parent()
            const imageData = ig.system.context!.getImageData(0, 0, cw, ch)
            const data = imageData.data
            for (const client of clients) {
                client.send(data)
            }
        },
    })

    http.createServer(function (req, res) {
        res.write(html)
        res.end()
    }).listen(3000, function () {
        console.log('server start at port 3000')
    })
}
