/** ECP – Encrypted Connection Protocol */
radio.setGroup(1)

Wait.waitForReady().then(function () {
    // 🔐 Step 1: Generate + Broadcast Key
    SharedKey.broadcastKey()
    let sharedKey = SharedKey.getKey()

    // 🧬 Step 2: Create AES Key Buffer
    let aesKeyBuf = AES.padKey(sharedKey)
    console.log("✅ AES buffer:" + aesKeyBuf.toHex())

    // 📩 Step 3: Encrypt and Send Sample Data
    let message = "Hello Secure World"
    let msgBuf = control.createBuffer(message.length)
    for (let i = 0; i < message.length; i++) msgBuf.setUint8(i, message.charCodeAt(i))

    let encrypted = AES.encrypt(msgBuf, aesKeyBuf)
    console.log(encrypted)
    radio.sendBuffer(Buffer.fromBase64(encrypted))
    console.log("🚀 Encrypted message transmitted!")
})