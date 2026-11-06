import { useEffect, useState, type ReactNode } from 'react';
import { InlineCode } from '@/components/ui/code';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import Disclosure from '@/components/ui/disclosure';
import SegmentedControl from '@/components/ui/segmented-control';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import CommandBlock from './command-block';
import { megabytes } from './format';
import { methodLabel } from './linux-text';
import type { LinuxFile, LinuxMethod, LinuxMethodKind, LinuxProp } from './types';

type Tab = LinuxMethodKind | 'files';

const LINUX_TAB_STORAGE_KEY = 'tablepro:linux-install';

function storedTab(tabs: Tab[]): Tab | null {
    try {
        const value = window.localStorage.getItem(LINUX_TAB_STORAGE_KEY);

        return tabs.find((tab) => tab === value) ?? null;
    } catch {
        return null;
    }
}

function storeTab(tab: Tab): void {
    try {
        window.localStorage.setItem(LINUX_TAB_STORAGE_KEY, tab);
    } catch {
        // Storage can be off or full; the choice then lasts for this page only.
    }
}

// The server renders the first method; the reader's last choice replaces it after mount. Every panel is in the
// markup, the unchosen ones hidden, so each command is in the page whichever tab shows.
export default function LinuxInstall({ linux }: { linux: LinuxProp }) {
    const { m, fmt } = useI18n();
    const strings = m.download.linux;
    const tabs: Tab[] = [...linux.methods.map((method) => method.kind), ...(linux.packages.length > 0 ? (['files'] as const) : [])];
    const [tab, setTab] = useState<Tab>(tabs[0] ?? 'files');

    useEffect(() => {
        const stored = storedTab(tabs);

        if (stored !== null) {
            setTab(stored);
        }
    }, []);

    const label = (each: Tab): string => (each === 'files' ? strings.files : methodLabel(each, linux, strings));

    return (
        <div className="max-w-[44rem]">
            <SegmentedControl<Tab>
                legend={strings.methods}
                name="linux-install"
                className="max-sm:[&_label]:px-2.5"
                value={tab}
                options={tabs.map((each) => ({ value: each, label: label(each) }))}
                onChange={(next) => {
                    setTab(next);
                    storeTab(next);
                }}
            />

            <div className="mt-6">
                {linux.methods.map((method) => (
                    <div key={method.kind} hidden={tab !== method.kind}>
                        <MethodPanel method={method} linux={linux} title={label(method.kind)} />
                    </div>
                ))}
                {tabs.includes('files') && (
                    <div hidden={tab !== 'files'}>
                        <FilesPanel linux={linux} />
                    </div>
                )}
            </div>
        </div>
    );
}

function MethodPanel({ method, linux, title }: { method: LinuxMethod; linux: LinuxProp; title: string }) {
    const { m, fmt } = useI18n();
    const strings = m.download.linux;
    const architectures = joinList(linux.architectures, m.download.orList);
    const distribution = linux.distributions.find((each) => each.via === method.kind && each.name !== null);
    const requirement =
        distribution !== undefined && distribution.name !== null
            ? fmt(strings.requirement, { name: distribution.name, versions: joinList(distribution.versions, m.download.orList), architectures })
            : fmt(strings.flatpakRequirement, { architectures, version: linux.desktop?.version ?? '' });

    return (
        <div className="grid gap-3">
            <CommandBlock
                lines={method.commands}
                title={m.download.homebrew.terminal}
                label={fmt(strings.commands, { method: title })}
                onCopied={() => trackDownload(`download-page-${method.kind}`, 'linux')}
            />
            <p className="type-small text-muted-foreground">{requirement}</p>
            {method.update !== null && (
                <p className="type-small text-foreground">
                    <Trans text={strings.update} values={{ command: method.update }} tags={{ code: (text) => <InlineCode>{text}</InlineCode> }} />
                </p>
            )}
        </div>
    );
}

function FilesPanel({ linux }: { linux: LinuxProp }) {
    const { m, fmt } = useI18n();
    const strings = m.download.linux;
    const { release, checksums } = linux;
    const example = linux.packages.flatMap((row) => Object.values(row.files)).find((file): file is LinuxFile => file !== null);

    const file = (each: LinuxFile | null): ReactNode => {
        if (each === null) {
            return (
                <span aria-hidden="true" className="text-muted-foreground">
                    –
                </span>
            );
        }

        const architecture = each.name.slice(each.name.lastIndexOf('-') + 1, each.name.lastIndexOf('.'));

        return (
            <span className="grid gap-0.5">
                <a
                    href={each.url}
                    aria-label={each.name}
                    onClick={() => trackDownload('download-page-files', 'linux')}
                    className={textLinkClasses('inline', 'justify-self-start font-mono text-[0.8125rem] whitespace-nowrap')}
                >
                    {architecture}
                </a>
                {each.bytes !== null && <span className="type-caption text-muted-foreground tabular-nums">{fmt(m.download.file.size, { size: megabytes(each.bytes, m.download.file.number) })}</span>}
            </span>
        );
    };

    return (
        <div className="grid gap-4">
            <div className="rounded-panel border border-rule">
                <DataTable caption={fmt(strings.table.caption, { version: release?.version ?? '' })} wrapperClassName="rounded-panel" className="sm:table-fixed [&_tbody>tr:first-child]:border-t-0">
                    <thead>
                        <tr>
                            <th scope="col" className={TABLE_HEAD_CELL}>
                                {strings.table.package}
                            </th>
                            {linux.architectures.map((architecture) => (
                                <th key={architecture} scope="col" className={`${TABLE_HEAD_CELL} font-mono font-medium sm:w-[30%]`}>
                                    {architecture}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {linux.packages.map((row) => (
                            <tr key={`${row.format}-${row.series ?? ''}`} className={TABLE_ROW}>
                                <th scope="row" className={TABLE_ROW_HEADER}>
                                    {row.distribution !== null && row.series !== null ? `${row.distribution} ${row.series}` : strings.table.bundle}
                                    <span className="type-caption block font-mono font-normal text-muted-foreground">.{row.format}</span>
                                </th>
                                {linux.architectures.map((architecture) => (
                                    <td key={architecture} className={TABLE_CELL}>
                                        {file(row.files[architecture] ?? null)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </div>

            {checksums !== null && (
                <p className="type-small text-foreground">
                    <Trans
                        text={strings.checksums}
                        values={{ file: checksums.name }}
                        tags={{
                            link: (text) =>
                                checksums.url !== null ? (
                                    <TextLink href={checksums.url} className="font-mono">
                                        {text}
                                    </TextLink>
                                ) : (
                                    <span className="font-mono">{text}</span>
                                ),
                        }}
                    />
                </p>
            )}

            {release !== null && (
                <p>
                    <TextLink href={release.releaseUrl} kind="standalone" external hrefLang="en">
                        {fmt(strings.release, { version: release.version })}
                    </TextLink>
                </p>
            )}

            {linux.verify !== null && example !== undefined && checksums !== null && (
                <Disclosure summary={strings.verify.summary}>
                    <p>{fmt(strings.verify.body, { file: checksums.name })}</p>
                    <CommandBlock
                        className="mt-3"
                        lines={[linux.verify.replace('{file}', example.name)]}
                        title={m.download.homebrew.terminal}
                        label={strings.verify.label}
                    />
                    <CommandBlock
                        className="mt-3"
                        lines={[`sha256sum --check --ignore-missing ${checksums.name}`]}
                        title={m.download.homebrew.terminal}
                        label={strings.verify.label}
                    />
                </Disclosure>
            )}
        </div>
    );
}
