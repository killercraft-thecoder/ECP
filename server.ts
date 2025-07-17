const ISERVER = game.ask("Server?")
const mySerial = control.deviceSerialNumber()
radio.setGroup(1)
let DataMappings: any = { "ME": "WAIT", "TEST": "TRUE" }


radio.onReceivedString(function (packet: string) {
    if (packet.substr(0, 10) == "SHAREDKEY|") {
        let parts = packet.split("|")
        if (parts.length == 2) {
            SharedKey._key = parseInt(parts[1])
            console.log(`🔐 Global key received: ${SharedKey._key}`)
        }
    }
    let parts = packet.split("|")
    let src = parseInt(parts[0])
    let dest = parts[1]
    let type = parts[2]
    let msgID = parts[3]
    let payload = parts[4]
    if (ISERVER && !(parts.length < 5)) {

        if (dest == mySerial.toString() || dest == "BCAST") {
            if (type == "MSG") {
                console.log(`📨 Message from ${src}: ${payload}`)
                radio.sendString(`${mySerial}|${src}|ACK|${msgID}|delivered`)
                console.log(`✅ ACK sent to ${src} for msgID ${msgID}`)
            } else if (type == "PING") {
                let response = DataMappings[payload] || "UNKNOWN"
                radio.sendString(`${mySerial}|${src}|PONG|${msgID}|${response}`)
                console.log(`🏓 PONG sent to ${src}: ${response}`)
            } else if (type == "ACK") {
                console.log(`🔔 ACK received from ${src} for msgID ${msgID}`)
            } else {
                console.log("⚠️ Unknown type: " + type)
            }
        }
    }
    if (packet.substr(0, 6) == "READY|") {
        console.log("📲 Another device is ready!")
        if (Wait.pending.length > 0) {
            Wait.pending[0].resolve()
            Wait.pending.removeAt(0)
        }
    }
    if (!(parts.length < 5)) {

    if (dest != mySerial.toString() && dest != "BCAST") return
    if (DH.handshakeCompleted) return

    if (type == "DH") {
        let values = payload.split(",")
        if (values.length != 3) return

        let incomingP = parseInt(values[0])
        let incomingG = parseInt(values[1])
        let peerKey = parseInt(values[2])

        DH.peerSerial = src
        DH.peerPublicKey = peerKey

        if (incomingP != DH.P || incomingG != DH.G) {
            console.log(`⚠️ DH param mismatch. Ignored.`)
            return
        }

        DH.computeSharedKey(DH.peerPublicKey)

        // Server replies back to client
        if (ISERVER) {
            let replyID = "dhack_" + Math.randomRange(1000, 9999)
            let reply = `${mySerial}|${src}|DHACK|${replyID}|${DH.publicKey}`
            pause(100)
            radio.sendString(reply)
            console.log(`📡 Server replied with DHACK`)
        }
    } else if (type == "DHACK" && !ISERVER) {
        let peerKey = parseInt(payload)
        DH.peerSerial = src
        DH.peerPublicKey = peerKey
        DH.computeSharedKey(DH.peerPublicKey)
    }
    }
    if (!ISERVER) {
        if (parts.length < 5) return
        if (dest == mySerial.toString()) {
            if (type == "ACK") {
                console.log(`✅ ACK received from ${src} for msgID ${msgID}`)
            } else if (type == "PONG") {
                console.log(`🏓 PONG from ${src}: ${payload}`)
                for (let i = 0; i < Client.pendingPromises.length; i++) {
                    if (Client.pendingPromises[i].id == msgID) {
                        Client.pendingPromises[i].resolve(payload)
                        Client.pendingPromises.removeAt(i)
                        break
                    }
                }
            } else if (type == "MSG") {
                console.log(`📨 Message from ${src}: ${payload}`)
                let ackPacket = `${mySerial}|${src}|ACK|${msgID}|received`
                radio.sendString(ackPacket)
            } else {
                console.log("⚠️ Unknown type received: " + type)
            }
        }
    }
})
