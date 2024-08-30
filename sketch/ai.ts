import OpenAI from 'openai'
import { IndividualPersonality } from './individual'
import { Message } from './message'
import { OpenAIKey } from './key'

class AIConnector {
    private static instance: AIConnector
    private openai: OpenAI

    topics: string[] = []

    constructor() {
        const apiKey = OpenAIKey
        if (!apiKey) {
            throw new Error('OPENAI_KEY is not set in the environment')
        }
        this.openai = new OpenAI({ apiKey })

        this.generateTopics()
            .then((topics) => (this.topics = topics))
            .catch(console.warn)
    }

    public static getInstance(): AIConnector {
        if (!AIConnector.instance) {
            AIConnector.instance = new AIConnector()
        }
        return AIConnector.instance
    }

    getNewTopic(): string {
        if (this.topics.length === 0) {
            return (
                'placeholder_topic_' + Math.random().toString(36).substring(7)
            )
        }
        const randomIndex = Math.floor(Math.random() * this.topics.length)
        return this.topics[randomIndex]
    }

    async generateTopics(count: number = 5): Promise<string[]> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a social media trend analyzer. Generate a list of current trending topics or hashtags.',
                },
                {
                    role: 'user',
                    content: `Generate ${count} trending topics or hashtags.`,
                },
            ],
            temperature: 0.7,
        })

        const topics =
            response.choices[0].message.content
                ?.split('\n')
                .map((topic) => topic.trim().replace(/^\d+\.\s*/, '')) || []
        return topics.slice(0, count)
    }

    async generateResponse(
        message: Message,
        personality: IndividualPersonality,
    ): Promise<string> {
        const personalityDescription = this.describePersonality(personality)

        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are simulating a social media user with the following personality: ${personalityDescription}`,
                },
                {
                    role: 'user',
                    content: `Respond to this message: "${message.topic}". The message has the following properties: aggressiveness (${message.property.aggressive}), integrity (${message.property.integrity}), attractiveness (${message.property.attractive}).`,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        })

        return response.choices[0].message.content || ''
    }

    private describePersonality(personality: IndividualPersonality): string {
        return `Openness: ${personality.openness.toFixed(2)},
                Conscientiousness: ${personality.conscientiousness.toFixed(2)},
                Extraversion: ${personality.extraversion.toFixed(2)},
                Agreeableness: ${personality.agreeableness.toFixed(2)},
                Neuroticism: ${personality.neuroticism.toFixed(2)}`
    }
}

export { AIConnector }
