import { ClientPacket, DataServer } from './connection-interface'
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

    constructor() {
        process.on('exit', () => {
            canvasServer.server?.stop()
        })
        window.addEventListener('beforeunload', () => {
            canvasServer.server?.stop()
        })
    }

    requestInstanceId?: (username: string) => Promise<number>
    inputCallback?: (instanceId: number, packet: ClientPacket) => Promise<void>

    SocketIoServer = SocketIoServer
}
