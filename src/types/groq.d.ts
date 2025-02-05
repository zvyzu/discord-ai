type messages = {
    role: 'assistant' | 'system' | 'user';
    content: string;
    name?: string;
};