interface PolarEmbedCheckout {
    create: (url: string, options?: { theme?: 'light' | 'dark' }) => Promise<void>;
}

declare global {
    interface Window {
        Polar?: {
            EmbedCheckout: PolarEmbedCheckout;
        };
    }
}

export {};
