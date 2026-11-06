import { useEffect, type ReactNode } from 'react';
import CellGrid from '@/components/ui/cell-grid';
import FaqList from '@/components/ui/faq-list';
import { cn } from '@/lib/utils';

export interface PricingFaqGroup {
    id: string;
    title: string;
    items: { id: string; question: string; answer: ReactNode }[];
}

// A link to a question, or to a group (/pricing#license), opens it: the old sections' anchors land on their answers.
function openTarget(): void {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id === '' ? null : document.getElementById(id);
    const details = target instanceof HTMLDetailsElement ? target : target?.querySelector('details');

    if (details) {
        details.open = true;
    }
}

export default function PricingFaq({ groups }: { groups: PricingFaqGroup[] }) {
    useEffect(() => {
        openTarget();
        window.addEventListener('hashchange', openTarget);

        return () => window.removeEventListener('hashchange', openTarget);
    }, []);

    return (
        <div>
            {groups.map((group, index) => (
                <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className={cn('scroll-mt-20', index > 0 && 'mt-px')}>
                    <CellGrid className="lg:grid-cols-12">
                        <div className="[--cell-pad-y:1rem] lg:col-span-4">
                            <h3 id={`${group.id}-title`} className="text-base leading-[1.45] font-semibold text-muted-foreground lg:sticky lg:top-24 md:text-[1.0625rem]">
                                {group.title}
                            </h3>
                        </div>
                        <div className="py-0 md:py-0 lg:col-span-8 xl:py-0">
                            <FaqList collapsible headingLevel="h4" className="cell-rows border-t-0 [&>*:last-child]:border-b-0" items={group.items} />
                        </div>
                    </CellGrid>
                </section>
            ))}
        </div>
    );
}
