namespace DH {
    // 🔢 Primes and possible generators (small and demo-safe)
    const primes = [23, 29, 31, 37, 41, 43, 47]
    const generators = [2, 3, 5, 7]

    // 🎲 Random prime + generator
    export const P = 47//primes[Math.randomRange(0, primes.length)]
    export const G = 5//generators[Math.randomRange(0, generators.length)]

    const mySerial = control.deviceSerialNumber()
    radio.setGroup(1)

    let sharedKey = -1
    let privateKey: number
    export let publicKey: number
    export let peerSerial = -1
    export let peerPublicKey = -1
    export let handshakeCompleted = false

    // 🔑 Generate keys
    export function generateKeys(): void {
        privateKey = 2//Math.randomRange(2, P - 2)
        publicKey = G//Math.pow(G, privateKey) % P
        console.log(`🔧 DH params: P=${P}, G=${G}, private=${privateKey}, public=${publicKey}`)
    }

    // 🧮 Compute shared key
    export function computeSharedKey(peerKey: number): void {
        sharedKey = Math.pow(peerKey, privateKey) % P
        handshakeCompleted = true
        console.log(`🔐 Shared key computed: ${sharedKey}`)
    }

    // 📡 Send DH data
    export function broadcastDH(): void {
        let msgID = "dh_" + Math.randomRange(1000, 9999)
        let packet = `${mySerial}|BCAST|DH|${msgID}|${P},${G},${publicKey}`
        radio.sendString(packet)
        console.log(`📤 Sent DH packet`)
    }

    // 🔁 Retry loop for client broadcast
    function keepSendingUntilComplete(): void {
        control.runInParallel(function () {
            while (!handshakeCompleted) {
                broadcastDH()
                pause(500)
            }
        })
    }

    // 🚀 Start handshake
    export function startHandshake(isServer: boolean): void {
        generateKeys()

        if (!ISERVER) {
            keepSendingUntilComplete()
        }
    }

    export function getSharedKey(): number {
        return sharedKey
    }

    export function isComplete(): boolean {
        return handshakeCompleted
    }
}