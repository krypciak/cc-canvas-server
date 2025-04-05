import { ClientPacket, DataServer } from './connection-interface'
import { poststart } from './plugin'
import { SocketIoServer } from './socketio'

declare global {
    var canvasServer: CanvasServer
    namespace NodeJS {
        interface Global {
            canvasServer: CanvasServer
        }
    }
}
export class CanvasServer {
    server!: DataServer

    constructor() {}

    requestInstanceId?: () => Promise<number>
    inputCallback?: (instanceId: number, packet: ClientPacket) => Promise<void>
}

poststart(() => {
    canvasServer.server = new SocketIoServer()
    process.on('exit', () => {
        canvasServer.server.stop()
    })
    window.addEventListener('beforeunload', () => {
        canvasServer.server.stop()
    })
})
