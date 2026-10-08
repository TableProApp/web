import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';

interface JumpListProps {
    /** Section ids and their headings, in page order. */
    items: { id: string; label: string }[];
}

export default function JumpList({ items }: JumpListProps) {
    const { m } = useI18n();

    return (
        <nav aria-label={m.blog.post.toc}>
            <ul className="type-small flex flex-wrap gap-x-5 gap-y-2">
                {items.map((item) => (
                    <li key={item.id}>
                        <a href={`#${item.id}`} className={textLinkClasses('inline')}>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
