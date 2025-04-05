import { assert } from './assert'
import { prestart } from './plugin'

export interface DataServer {
    connections: DataConnection[]

    start(): Promise<void>
    stop(): Promise<void>
}
export interface DataConnection {
    instanceId: number

    isConnected(): boolean
    send(data: unknown): void
    close(): void
}

declare global {
    namespace ig {
        var canvasDataConnection: DataConnection | undefined
    }
}
export interface Packet {
    canvasData: ArrayBuffer
}

prestart(() => {
    ig.Game.inject({
        finalDraw() {
            this.parent()
            if (ig.canvasDataConnection) {
                assert(ig.system.context)
                const canvasData = ig.system.context.getImageData(0, 0, ig.system.canvas.width, ig.system.canvas.height)
                const packet: Packet = {
                    canvasData: canvasData.data,
                }
                ig.canvasDataConnection.send(packet)
            }
        },
    })
})
