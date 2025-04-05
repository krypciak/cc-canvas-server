import { Peer } from 'peerjs'
import { prestart } from './plugin'

prestart(() => {
    client1()
})

function client1() {
    const client = 'client1'
    const peer = new Peer('', {
        // host: location.hostname,
        // port: location.port || (location.protocol === 'https:' ? 443 : 80),
        // path: '/peerjs',
        // debug: 3,
    })
    let peerId: string
    peer.on('open', id => {
        peerId = id
        console.log(client, 'open', id)

        client2(id)
    })
    peer.on('error', err => {
        alert('' + err)
    })

    peer.on('open', () => {
        console.log(client, 'waiting for other client...')
    })
    peer.on('connection', conn => {
        console.log(client, 'other client joined!')

        conn.on('data', data => {
            console.log(client, 'data:', data)

            setTimeout(() => {
                conn.send('hi from ' + client)
            }, 1000)
        })

        // setTimeout(() => {
        //     conn.send('welcome!!!')
        // }, 1000)
    })
}

function client2(destId: string) {
}
