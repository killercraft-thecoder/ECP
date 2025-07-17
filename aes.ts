// Add your code here
namespace AES {
    const sbox: number[] = [
        // A small sample substitution box — extend or randomize as needed!
        0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
        0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76
    ]
    function generateInverseSbox(original: number[]): number[] {
        let inverse = []
        for (let i = 0; i < 256; i++) inverse.push(0)
        for (let i = 0; i < original.length; i++) {
            inverse[original[i]] = i
        }
        return inverse
    }

    const sbox2 = generateInverseSbox(sbox)
    function subBytes(buffer: Buffer): Buffer {
        let output = control.createBuffer(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            let val = buffer.getUint8(i)
            output.setUint8(i, sbox[val % sbox.length]) // Wrap around for simplicity
        }
        return output
    }
    function usubBytes(buffer: Buffer): Buffer {
        let output = control.createBuffer(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            let val = buffer.getUint8(i)
            output.setUint8(i, sbox2[val % sbox.length]) // Wrap around for simplicity
        }
        return output
    }
    function shiftRows(buffer: Buffer): Buffer {
        let output = control.createBuffer(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            let shiftedIndex = (i + (i % 4)) % buffer.length
            output.setUint8(i, buffer.getUint8(shiftedIndex))
        }
        return output
    }

    function mixColumns(buffer: Buffer): Buffer {
        let output = control.createBuffer(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            let val = buffer.getUint8(i)
            output.setUint8(i, ((val << 1) ^ val ^ 0x1b) & 0xFF) // Basic XOR mix
        }
        return output
    }

    function addRoundKey(buffer: Buffer, key: Buffer): Buffer {
        let output = control.createBuffer(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            output.setUint8(i, buffer.getUint8(i) ^ key.getUint8(i % key.length))
        }
        return output
    }

    export function encrypt(input: Buffer, key: Buffer): string {
        let state = input

        // 📘 AES-like stages
        state = subBytes(state)
        state = shiftRows(state)
        state = mixColumns(state)
        state = addRoundKey(state, key)

        return state.toBase64()
    }

    export function decrypt(encoded: string, key: Buffer): Buffer {
        let state = Buffer.fromBase64(encoded)

        // 🔄 Reverse order for decryption
        state = addRoundKey(state, key)
        state = mixColumns(state)
        state = shiftRows(state)
        state = usubBytes(state) // reverse S-Box would go here if needed

        return state
    }

    export function padKey(key32:number) {
        const buf = Buffer.create(16)
        
        for (let i = 0; i < 3; i++) {
            buf.setNumber(NumberFormat.UInt32LE, i, key32)
        }
        return buf;
    }
}