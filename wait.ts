namespace Wait {
    class Connection {
        public timestamp: number
        constructor() {
            this.timestamp = control.millis()
        }

        public isFresh(): boolean {
            return control.millis() - this.timestamp < 10000
        }
    }

    class Promise<Connection> {
        private resolved = false
        private conn: any = null
        private resolver: (conn: Connection) => void = null
        
        constructor() {}

        public then(res: (conn: Connection) => void): void {
            this.resolver = res
            let id = setInterval(function() {
                if (this.resolved && this.conn) res(this.conn); clearInterval(id)
            },100)
        }

        public resolve(): void {
            if (!this.resolved) {
                this.conn = new Connection()
                this.resolved = true
                if (this.resolver) this.resolver(this.conn)
            }
        }
    }

    export let pending: Promise<Connection>[] = []

    export function waitForReady(): Promise<Connection> {
        let promise = new Promise<Connection>()
        pending.push(promise)

        // Broadcast our readiness so others can respond
        let msgID = "ready" + Math.randomRange(1000, 9999)
        radio.sendString(`READY|${msgID}`)
        console.log("📡 Broadcasted readiness")

        return promise
    }
}