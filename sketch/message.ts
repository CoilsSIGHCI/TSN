type MessageProperty = {
    aggressive: number
    integrity: number
    attractive: number
}

class Message {
    sender: Individual
    property: MessageProperty
    topic: string

    constructor(sender: Individual, property: MessageProperty, topic: string) {
        this.sender = sender
        this.property = property
        this.topic = topic
    }

    propagate(receiver: Individual) {
        const flaggedMessage: FlaggedMessage = {
            ...this,
            read: false,
        }
        receiver.inbox.push(flaggedMessage)
    }
}
