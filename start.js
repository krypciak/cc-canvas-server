#!/bin/node
import { startCrossnode } from '../crossnode/crossnode.js'
startCrossnode({
    ccloader2: true,

    modWhitelist: ['cc-canvas-server'],
})
