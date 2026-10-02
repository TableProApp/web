/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/dialog.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Button, { type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { cn } from '@/lib/utils';

interface DialogProps {
    open: boolean;
    /** Called for Cancel, Escape and a click on the backdrop. Not while busy. */
    onClose: () => void;
    title: ReactNode;
    /** The body: what happens, and a list of consequences where actions cascade. */
    children?: ReactNode;
    confirmLabel: ReactNode;
    cancelLabel: ReactNode;
    /** Paints the confirm button `danger`, and gives Cancel the first focus. */
    destructive?: boolean;
    busy?: boolean;
    /** Shown inline above the actions after a failed confirm; the dialog stays open. */
    error?: ReactNode;
    onConfirm: () => void;
}

/**
 * A modal on the native `<dialog>` (design-system §5.3.20).
 *
 * `showModal()` supplies the focus trap, the top layer and Escape. What it does
 * not supply is done here: the body stops scrolling, focus returns to whatever
 * opened the dialog, and a destructive dialog focuses Cancel first, so a
 * reflexive Enter does not delete anything.
 *
 * 480px wide at most, on `--raised`, over the `--overlay` backdrop. Actions are
 * right-aligned, Cancel first; below 480px they stack full width in the same
 * order.
 *
 * The backdrop colour is written out rather than read from `--overlay`: older
 * browsers do not let `::backdrop` inherit custom properties from the page.
 */
export function Dialog({ open, onClose, title, children, confirmLabel, cancelLabel, destructive = false, busy = false, error, onConfirm }: DialogProps) {
    const titleId = useId();
    const ref = useRef<HTMLDialogElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const opener = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            document.body.style.overflow = 'hidden';
            dialog.showModal();

            if (destructive) {
                cancelRef.current?.focus();
            }
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open, destructive]);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        const restore = (): void => {
            document.body.style.overflow = '';
            opener.current?.focus();
            opener.current = null;
        };

        dialog.addEventListener('close', restore);

        return () => {
            dialog.removeEventListener('close', restore);
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();

                if (!busy) {
                    onClose();
                }
            }}
            onClick={(event) => {
                // A click on the backdrop lands on the <dialog> itself, outside its box.
                if (busy || event.target !== ref.current) {
                    return;
                }

                const box = ref.current.getBoundingClientRect();
                const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;

                if (!inside) {
                    onClose();
                }
            }}
            className="m-auto w-[calc(100vw-2rem)] max-w-[30rem] rounded-panel border border-rule bg-raised p-0 text-foreground shadow-overlay backdrop:bg-[oklch(0_0_0/0.45)]"
        >
            <div className="p-6">
                <h2 id={titleId} className="type-h3">
                    {title}
                </h2>
                {children && <div className="type-small mt-2 space-y-2 text-foreground">{children}</div>}
                {error && (
                    <Callout tone="danger" role="alert" className="mt-4">
                        {error}
                    </Callout>
                )}
                <div className="mt-6 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:justify-end">
                    <Button variant="quiet" buttonRef={cancelRef} disabled={busy} onClick={onClose} className="max-[479px]:w-full">
                        {cancelLabel}
                    </Button>
                    <Button variant={destructive ? 'danger' : 'primary'} loading={busy} onClick={onConfirm} className="max-[479px]:w-full">
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}

interface ConfirmDialogProps {
    triggerLabel: ReactNode;
    triggerVariant?: ButtonVariant;
    triggerSize?: ButtonSize;
    triggerClassName?: string;
    title: ReactNode;
    description?: ReactNode;
    confirmLabel: ReactNode;
    cancelLabel: ReactNode;
    destructive?: boolean;
    disabled?: boolean;
    /** Shown when `onConfirm` rejects. The dialog stays open so the reader can retry or cancel. */
    errorMessage?: ReactNode;
    /**
     * Must resolve when the work is finished, or the busy state ends before the
     * request does. It closes the dialog on success.
     */
    onConfirm: () => void | Promise<void>;
}

/** A trigger button and its confirmation dialog. */
export default function ConfirmDialog({
    triggerLabel,
    triggerVariant = 'secondary',
    triggerSize = 'sm',
    triggerClassName,
    title,
    description,
    confirmLabel,
    cancelLabel,
    destructive = false,
    disabled = false,
    errorMessage,
    onConfirm,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    async function confirm(): Promise<void> {
        setBusy(true);
        setFailed(false);

        try {
            await onConfirm();
            setOpen(false);
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Button
                variant={triggerVariant}
                size={triggerSize}
                disabled={disabled}
                aria-haspopup="dialog"
                onClick={() => {
                    setFailed(false);
                    setOpen(true);
                }}
                className={cn(triggerClassName)}
            >
                {triggerLabel}
            </Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                destructive={destructive}
                busy={busy}
                error={failed ? errorMessage : undefined}
                onConfirm={confirm}
            >
                {description}
            </Dialog>
        </>
    );
}
