import Container from '@/components/ui/container';
import { AlsoAnchors, PartDetails, PartText, PlanPills, type PartContext } from './feature-part';
import type { FeaturePart } from './types';

// The smaller sub-features as plain text in two columns, no cards or icons. Each item keeps its id, since database
// pages and blog posts link some of them.
export default function MoreList({ items, title, context }: { items: FeaturePart[]; title: string; context: PartContext }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section id="more" aria-labelledby="more-title" className="py-14 md:py-20">
            <Container>
                <div className="grid gap-8 md:grid-cols-12 md:gap-x-8">
                    <h2 id="more-title" className="text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground md:col-span-4 lg:col-span-3">
                        {title}
                    </h2>
                    <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:col-span-8 lg:col-span-9">
                        {items.map((item) => (
                            <li key={item.id} id={item.id} className="scroll-mt-16">
                                <AlsoAnchors part={item} />
                                <h3 className="text-[1.0625rem] leading-[1.35] font-semibold tracking-[-0.012em] text-foreground">
                                    {item.title}
                                    <PlanPills paid={item.paid} labels={context.labels} className="ml-2" />
                                </h3>
                                <PartText part={item} values={context.values} className="mt-2 text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground" />
                                <PartDetails part={item} context={context} className="mt-3" />
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </section>
    );
}
