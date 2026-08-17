import { useEffect, useRef, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { useEmailForm } from '@/hooks/use-email-form';
import { trackEvent } from '@/lib/analytics';

const columns = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '/#features' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'Download', href: '/download' },
            { label: 'vs DBeaver', href: '/compare/dbeaver' },
            { label: 'vs DataGrip', href: '/compare/datagrip' },
            { label: 'vs Beekeeper Studio', href: '/compare/beekeeper-studio' },
            { label: 'vs Postico', href: '/compare/postico' },
            { label: 'vs Sequel Ace', href: '/compare/sequel-ace' },
            { label: 'vs Navicat', href: '/compare/navicat' },
            { label: 'vs HeidiSQL', href: '/compare/heidisql' },
            { label: 'vs phpMyAdmin', href: '/compare/phpmyadmin' },
            // Two of the ten comparison pages had no link anywhere on the site.
            { label: 'vs Sequel Pro', href: '/compare/sequel-pro' },
            { label: 'vs Azimutt', href: '/compare/azimutt' },
        ],
    },
    {
        title: 'Databases',
        links: [
            { label: 'MySQL', href: '/mysql-client' },
            { label: 'PostgreSQL', href: '/postgresql-client' },
            { label: 'MariaDB', href: '/mariadb-client' },
            { label: 'SQLite', href: '/sqlite-client' },
            { label: 'MongoDB', href: '/mongodb-client' },
            { label: 'Redis', href: '/redis-gui' },
            { label: 'SQL Server', href: '/sql-server-client' },
            { label: 'Oracle', href: '/oracle-client' },
            { label: 'Snowflake', href: '/snowflake-client' },
            { label: 'Redshift', href: '/redshift-client' },
            { label: 'ClickHouse', href: '/clickhouse-client' },
            { label: 'DuckDB', href: '/duckdb-client' },
            { label: 'Cassandra', href: '/cassandra-client' },
            { label: 'Cloudflare D1', href: '/cloudflare-d1-client' },
            { label: 'libSQL / Turso', href: '/turso-client' },
            { label: 'DynamoDB', href: '/dynamodb-gui' },
            { label: 'BigQuery', href: '/bigquery-client' },
            { label: 'etcd', href: '/etcd-gui' },
            { label: 'CockroachDB', href: '/cockroachdb-client' },
            { label: 'Elasticsearch', href: '/elasticsearch-client' },
            { label: 'ScyllaDB', href: '/scylladb-client' },
            { label: 'PGlite', href: '/pglite-client' },
            { label: 'SurrealDB', href: '/surrealdb-client' },
            { label: 'Teradata', href: '/teradata-client' },
            { label: 'Trino', href: '/trino-client' },
            { label: 'Beancount', href: '/beancount-client' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Docs', href: 'https://docs.tablepro.app', external: true },
            { label: 'Blog', href: '/blog' },
            { label: 'FAQ', href: '/faq' },
            { label: 'My Account', href: '/account' },
            { label: 'Changelog', href: 'https://docs.tablepro.app/changelog', external: true },
            { label: 'GitHub', href: 'https://github.com/TableProApp/TablePro', external: true },
            { label: 'Sponsor', href: 'https://github.com/sponsors/datlechin', external: true },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
        ],
    },
    {
        title: 'Community',
        links: [
            { label: 'Discord', href: 'https://discord.gg/hCNmUUbnD4', external: true },
            { label: 'X', href: 'https://x.com/tableproapp', external: true },
            { label: 'Facebook', href: 'https://www.facebook.com/tableproapp', external: true },
            { label: 'Telegram', href: 'https://t.me/tablepro_app', external: true },
        ],
    },
];

const INPUT_CLASS =
    'min-w-0 flex-1 rounded-lg border border-rule bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50';

const flashColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
};

/**
 * The newsletter, moved down from the closing call to action.
 *
 * It used to render as a sibling panel beside the Mac download, which put a
 * second, non-download conversion goal at the single highest-intent moment on
 * the page. Down here it competes with nothing.
 *
 * The subscriber count is decoration, so it must not cost a request on page
 * load. The fetch waits until the panel is within 200px of the viewport, and the
 * AbortController still cancels an in-flight request if the footer unmounts.
 */
function Newsletter() {
    const form = useEmailForm('/newsletter/subscribe');
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = new AbortController();

        function loadStats() {
            fetch('/api/newsletter/stats', { signal: controller.signal, headers: { Accept: 'application/json' } })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data && typeof data.count === 'number') {
                        setSubscriberCount(data.count);
                    }
                })
                .catch(() => undefined);
        }

        const node = anchorRef.current;

        if (!node || typeof IntersectionObserver === 'undefined') {
            loadStats();

            return () => controller.abort();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer.disconnect();
                    loadStats();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            controller.abort();
        };
    }, []);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        trackEvent('newsletter_signup_clicked', { source: 'footer' });
        form.submit();
    }

    return (
        <div ref={anchorRef} className="px-4 py-6 sm:px-6">
            <h3 className="font-semibold text-foreground">Stay updated</h3>
            <p className="mt-2 text-muted-foreground">
                Release notes and database notes. About one email a month, unsubscribe any time.
                {subscriberCount !== null && subscriberCount > 0 && (
                    <>
                        {' '}
                        Join {subscriberCount.toLocaleString()}{' '}
                        {subscriberCount === 1 ? 'developer' : 'developers'}.
                    </>
                )}
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:gap-3">
                <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                </label>
                <input
                    id="newsletter-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => form.setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={form.processing}
                    className={INPUT_CLASS}
                />
                <button
                    type="submit"
                    disabled={form.processing}
                    className={buttonClasses('primary', 'sm', 'shrink-0 disabled:opacity-50')}
                >
                    {form.processing ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
            {form.error && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                    {form.error}
                </p>
            )}
            {form.flash?.message && (
                <p role="status" className={`mt-3 text-sm ${flashColors[form.flash.type]}`}>
                    {form.flash.message}
                </p>
            )}
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="text-sm/loose" role="contentinfo">
            <div className="h-12 sm:h-16 lg:h-24" />

            <FullLine />
            <Container>
                <Newsletter />
            </Container>

            {/* Link columns */}
            <FullLine />
            <Container>
                <div className="grid grid-cols-2 md:grid-cols-4">
                    {columns.map((col, colIndex) => (
                        <div
                            key={col.title}
                            className={`
                                border-rule p-6 sm:p-8
                                ${colIndex < 2 ? 'border-b md:border-b-0' : ''}
                                ${colIndex % 2 === 0 ? 'border-r' : 'max-md:border-r-0'}
                                ${colIndex < 3 ? 'md:border-r' : ''}
                            `}
                        >
                            <h3 className="font-semibold text-foreground">{col.title}</h3>
                            <ul className="mt-4 grid gap-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            className="text-muted-foreground hover:underline"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            {/* Copyright */}
            <Container>
                <p className="px-4 py-6 text-muted-foreground">
                    &copy; {new Date().getFullYear()} TablePro. All rights reserved.
                </p>
            </Container>
            <FullLine />

            {/* Giant brand name watermark */}
            <div className="mx-auto max-w-7xl overflow-hidden leading-[0]" aria-hidden="true">
                <svg className="block w-full text-primary" viewBox="0 0 600 110" preserveAspectRatio="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="108" textAnchor="middle" fontSize="140" fontWeight="900" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letterSpacing="-6">
                        TablePro
                    </text>
                </svg>
            </div>
        </footer>
    );
}
