namespace SharedKey {
    export let _key = -1
    let mySerial = control.deviceSerialNumber()
    let initialized = false

    export function broadcastKey(globalKey?: number): void {
        if (isSet()) return
        _key = globalKey || ((randint(0, 255) << 24) | (randint(0, 255) << 16) | (randint(0, 255) << 8) | randint(0, 255))
        console.log(`🔐 32-bit key generated: ${_key}`)
        radio.sendString(`SHAREDKEY|${_key}`)
        pause(5)
        radio.sendString(`SHAREDKEY|${_key}`)
        console.log(`📡 Shared key broadcast: ${_key}`)
    }

    export function isSet(): boolean {
        return _key != -1
    }

    export function getKey(): number {
        return _key
    }
}