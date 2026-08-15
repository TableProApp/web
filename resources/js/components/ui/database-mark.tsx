interface DatabaseMarkProps {
    icon?: string | null;
    /** Two-letter fallback used when no icon file exists for the engine. */
    monogram?: string | null;
    name: string;
}

/**
 * The 40x40 mark on a database tile. Decorative in both branches: the tile
 * always renders the engine's name as text, which is the accessible label.
 */
export default function DatabaseMark({ icon, monogram, name }: DatabaseMarkProps) {
    if (icon) {
        return (
            <img
                src={icon}
                alt=""
                aria-hidden="true"
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="size-10 object-contain opacity-40 grayscale transition-[opacity,filter] duration-(--dur-state) ease-(--ease-feedback) group-hover:opacity-100 group-hover:grayscale-0 dark:invert group-hover:dark:invert-0 group-focus-within:opacity-100 group-focus-within:grayscale-0 group-focus-within:dark:invert-0"
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            title={name}
            className="grid size-10 place-items-center border border-rule-strong font-mono text-sm font-semibold text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) group-hover:border-primary/40 group-focus-within:border-primary/40"
        >
            {monogram ?? name.slice(0, 2).toUpperCase()}
        </span>
    );
}
