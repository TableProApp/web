interface LemonSqueezy {
    Url: { Open: (url: string) => void };
}

declare global {
    interface Window {
        LemonSqueezy?: LemonSqueezy;
    }
}

export {};
