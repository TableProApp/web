import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';

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

export default function Footer() {
    return (
        <footer className="text-sm/loose" role="contentinfo">
            <div className="h-12 sm:h-16 lg:h-24" />

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
