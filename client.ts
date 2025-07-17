namespace Client {
    const mySerial = control.deviceSerialNumber()
    radio.setGroup(1)
    let msgCounter = 0
    // Just for Neat Typing
    export class Response { }
    export class Promise<Response> {
        private msgID: string
        private resolved: boolean = false
        private value: string = ""
        private resolver: (value: string) => void = null

        constructor(msgID: string) {
            this.msgID = msgID
        }

        public then(res: (value: string) => void): void {
            this.resolver = res
            if (this.resolved) {
                this.resolver(this.value)
            }
        }

        public resolve(data: string): void {
            if (!this.resolved) {
                this.resolved = true
                this.value = data
                if (this.resolver) {
                    this.resolver(this.value)
                }
            }
        }

        public get id(): string {
            return this.msgID
        }
    }

    export let pendingPromises: Promise<Response>[] = []

    function sendMessage(dest: string, payload: string): void {
        let msgID = "msg" + msgCounter++
        let packet = `${mySerial}|${dest}|MSG|${msgID}|${payload}`
        radio.sendString(packet)
        console.log(`🚀 Sent MSG to ${dest}: ${payload} (ID: ${msgID})`)
    }

    export function sendPing(dest: string, query: string): Promise<Response> {
        let msgID = "ping" + msgCounter++
        let packet = `${mySerial}|${dest}|PING|${msgID}|${query}`
        radio.sendString(packet)
        console.log(`🔍 Sent PING to ${dest}: ${query} (ID: ${msgID})`)

        let promise = new Promise<Response>(msgID)
        pendingPromises.push(promise)
        return promise
    }

    // 🔘 Example usage
    let ping = sendPing("BCAST", "ME")
    ping.then(function (response: string) {
        console.log(`🔧 Ping resolved with: ${response}`)
    })
}