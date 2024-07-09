// web-serial.d.ts
interface Navigator {
    serial: Serial
}

interface Serial {
    requestPort: () => Promise<SerialPort>
    // Add other properties and methods as needed
}

interface SerialPort {
    open: (options: { baudRate: number }) => Promise<void>
    readable: ReadableStream<Uint8Array>
    writable: WritableStream<Uint8Array>
    // Add other properties and methods as needed
}
