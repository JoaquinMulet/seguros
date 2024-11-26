export interface Message {
    sender: 'user' | 'assistant';
    text: string;
}

export interface ChatState {
    sessionId: string;
    messages: Message[];
    selectedPolicy: string | null;
}
