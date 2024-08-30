type Connection = {
    0: number
    1: number
}

class TSNDevice {
    private port: any | null
    private outputStream: WritableStream<string> | null
    private inputStream: ReadableStream<string> | null
    private reader: ReadableStreamDefaultReader<string> | null
    private inputDone: Promise<void> | null
    private outputDone: Promise<void> | null

    private static instance: TSNDevice

    recentLine: string = ''

    constructor() {
        this.port = null
        this.outputStream = null
        this.inputStream = null
        this.reader = null
        this.inputDone = null
        this.outputDone = null
    }

    public static getInstance(): TSNDevice {
        if (!TSNDevice.instance) {
            TSNDevice.instance = new TSNDevice()
        }
        return TSNDevice.instance
    }

    async connect(): Promise<void> {
        this.port = await (navigator as any).serial.requestPort()
        await this.port.open({ baudRate: 115200 })

        const textEncoder = new TextEncoderStream()
        this.outputDone = textEncoder.readable.pipeTo(
            this.port.writable as WritableStream<Uint8Array>,
        )
        this.outputStream = textEncoder.writable

        const textDecoder = new TextDecoderStream()
        this.inputDone = this.port.readable!.pipeTo(textDecoder.writable)
        this.inputStream = textDecoder.readable
        this.reader = this.inputStream.getReader()
    }

    async read(): Promise<void> {
        if (!this.reader) {
            return
        }
        let lineBuffer = ''

        while (true) {
            const { value, done } = await this.reader!.read()

            if (done) {
                break
            }

            lineBuffer += value
            let lines = lineBuffer.split('\n')
            if (lines.length > 1) {
                this.recentLine = lines[0]
                lineBuffer = lines[1]
            }
        }
    }

    connections(): Connection[] {
        if (this.recentLine.length == 0) {
            return []
        }

        return JSON.parse(this.recentLine)
    }
}
