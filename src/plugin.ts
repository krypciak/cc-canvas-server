import { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Mod1 } from './types'
import type {} from 'crossnode/crossnode'
import type {} from 'cc-instanceinator/src/plugin'

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
        if (window.crossnode) {
            run()
        }
    }
}

import type { WebSocket } from 'ws'

type Instance = {
    id: number
    width: number
    height: number
}
type InfoUpdatePacket = {
    type: 'info'
    instances: Instance[]
}
function getInfoUpdatePacket(): InfoUpdatePacket {
    const instances: Instance[] = []
    if (window.instanceinator) {
        for (const id in instanceinator.instances) {
            const inst = instanceinator.instances[id]
            if (!inst.display) continue
            instances.push({
                id: Number(id),
                width: inst.ig.system.canvas.width,
                height: inst.ig.system.canvas.height,
            })
        }
    } else {
        instances.push({
            id: 0,
            width: ig.system.canvas.width,
            height: ig.system.canvas.height,
        })
    }
    return {
        type: 'info',
        instances,
    }
}
type NowUpdatePacket = {
    type: 'now'
    now: number
}
function getCurrentInstanceId(): number {
    return window.instanceinator ? instanceinator.instanceId : 0
}
function getNowUpdatePacket(id: number): NowUpdatePacket {
    return {
        type: 'now',
        now: id,
    }
}

type Packet = NowUpdatePacket | InfoUpdatePacket

const clients: WebSocket[] = []
function run() {
    const ws: typeof import('ws') = window.require('ws')
    const http: typeof import('http') = window.require('http')

    const wsPort = 8080

    const wss = new ws.Server({ port: wsPort })
    wss.on('connection', ws => {
        clients.push(ws)

        ws.send(JSON.stringify(getInfoUpdatePacket()))

        ws.on('message', message => {
            console.log(`Received: ${message}`)
            ws.send(`You said: ${message}`)
        })

        ws.on('close', () => {
            clients.erase(ws)
        })
    })

    function sendUpdatePacket() {
        sendData(JSON.stringify(getNowUpdatePacket(getCurrentInstanceId())))
    }
    ig.Game.inject({
        finalDraw() {
            this.parent()
            const data = getCanvasData(ig.system.context!, ig.system.canvas.width, ig.system.canvas.height)
            sendUpdatePacket()
            sendData(data)
        },
    })

    http.createServer((_req, res) => {
        const html = getHtml(wsPort)
        res.write(html)
        res.end()
    }).listen(3000, function () {
        console.log('Canvas server start at http://localhost:3000')
    })

    if (window.instanceinator) {
        instanceinator.appendListeners.push(() => {
            sendUpdatePacket()
        })
        instanceinator.deleteListeners.push(() => {
            sendUpdatePacket()
        })
    }
}

type BufferLike = Parameters<WebSocket['send']>[0]
function sendData(data: BufferLike) {
    for (const client of clients) {
        client.send(data)
    }
}

function getCanvasData(ctx: CanvasRenderingContext2D, cw: number, ch: number): Uint8ClampedArray {
    const imageData = ctx.getImageData(0, 0, cw, ch)
    const data = imageData.data
    return data
}

function getHtml(wsPort: number) {
    let canvasesDiv!: HTMLDivElement

    const js = function jsFunc() {
        // @ts-expect-error
        const socket = new WebSocket(`ws://localhost:${wsPort}`)

        let instances: Instance[] = []
        let nowInstanceId: number = 0

        let idToInstance: Record<number, Instance> = {}
        let ctxRecord: Record<number, CanvasRenderingContext2D> = {}

        function initCanvases() {
            ctxRecord = {}
            idToInstance = {}
            canvasesDiv.innerHTML = ''
            for (const inst of instances) {
                const canvas = document.createElement('canvas')
                canvas.width = inst.width
                canvas.height = inst.height
                canvasesDiv.appendChild(canvas)
                const ctx = canvas.getContext('2d')!
                ctxRecord[inst.id] = ctx
                idToInstance[inst.id] = inst
            }
            console.log('initialized canvases:', instances)
        }

        socket.addEventListener('open', _event => {
            // socket.send('Hello Server!')
        })
        socket.addEventListener('message', event => {
            if (typeof event.data == 'string') {
                const data: Packet = JSON.parse(event.data)
                if (data.type == 'now') {
                    nowInstanceId = data.now
                } else if (data.type == 'info') {
                    instances = data.instances
                    initCanvases()
                }
            } else if (typeof event.data == 'object') {
                if (instances.length > 0) {
                    const ctx = ctxRecord[nowInstanceId]
                    const inst = idToInstance[nowInstanceId]
                    const blob = event.data as unknown as Blob
                    blob.arrayBuffer().then(buffer => {
                        const data = new Uint8ClampedArray(buffer)
                        const imageData = new ImageData(data, inst.width, inst.height)
                        ctx.putImageData(imageData, 0, 0)
                    })
                }
            }
        })
    }
    return `<!doctype html >
        <html>
            <head> </head>
            <body>
                <div id="canvasesDiv">
                </div>
                <script>
                    var wsPort = ${wsPort}
                    ${js.toString()}
                    jsFunc()
                </script>
            </body>
        </html>
    `
}
