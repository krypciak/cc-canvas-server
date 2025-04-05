import '../../../../game/page/game-base.css'
import '../../../../impact/page/css/style.css'
import './ig-sc'
import type { Packet } from '../../src/connection-interface'

import * as io from 'socket.io-client'
import { ig } from './ig-sc'

const host = 'localhost'
const port = 33405

const url = `ws://${host}:${port}`

const socket = io.io(url)

const tempCanvas = document.createElement('canvas')
tempCanvas.width = ig.system.width
tempCanvas.height = ig.system.height
const tempCtx = tempCanvas.getContext('2d', { alpha: false, desynchronized: true })!

socket.on('update', (data: Packet) => {
    const arr = new Uint8ClampedArray(data.canvasData)
    const imageData = new ImageData(arr, 568, 320)
    if (ig.system.scale == 1) {
        ig.system.context.putImageData(imageData, 0, 0)
    } else {
        tempCtx.putImageData(imageData, 0, 0)
        ig.system.context.drawImage(tempCanvas, 0, 0)
    }
})
