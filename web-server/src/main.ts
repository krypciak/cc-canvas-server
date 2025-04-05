import '../../../../game/page/game-base.css'
import '../../../../impact/page/css/style.css'
import { ig } from './ig-sc'
import type { ClientPacket, DummyUpdateInput, ServerPacket } from '../../src/connection-interface'
import { Input } from './input'

import * as io from 'socket.io-client'

const host = 'localhost'
const port = 33405

const url = `ws://${host}:${port}`

const socket = io.io(url)

const tempCanvas = document.createElement('canvas')
tempCanvas.width = ig.system.width
tempCanvas.height = ig.system.height
const tempCtx = tempCanvas.getContext('2d', { alpha: false, desynchronized: true })!

socket.on('update', (data: ServerPacket) => {
    const arr = new Uint8ClampedArray(data.canvasData)
    const imageData = new ImageData(arr, 568, 320)
    if (ig.system.scale == 1) {
        ig.system.context.putImageData(imageData, 0, 0)
    } else {
        tempCtx.putImageData(imageData, 0, 0)
        ig.system.context.drawImage(tempCanvas, 0, 0)
    }
})

function getDummyUpdateKeyboardInputFromIgInput(input: Input): DummyUpdateInput {
    return {
        isUsingMouse: input.isUsingMouse,
        isUsingKeyboard: input.isUsingKeyboard,
        isUsingAccelerometer: input.isUsingAccelerometer,
        ignoreKeyboard: input.ignoreKeyboard,
        mouseGuiActive: input.mouseGuiActive,
        mouse: input.mouse,
        accel: input.accel,
        presses: input.presses,
        keyups: input.keyups,
        locks: input.locks,
        delayedKeyup: input.delayedKeyup,
        currentDevice: input.currentDevice,
        actions: input.actions,
    }
}

setInterval(() => {
    const input: DummyUpdateInput = getDummyUpdateKeyboardInputFromIgInput(ig.input)
    const packet: ClientPacket = {
        input,
    }
    socket.emit('input', packet)
    ig.input.clearPressed()
}, 1000 / ig.system.fps)
