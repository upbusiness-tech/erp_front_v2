import { useEffect, useRef } from "react";

export type BarcodeScanHandler = (code: string) => void | Promise<void>;

export type UseBarcodeScannerOptions = {
  enabled?: boolean;
  minLength?: number;
  maxKeyIntervalMs?: number;
  resetAfterMs?: number;
  ignoreWhen?: () => boolean;
  onScan: BarcodeScanHandler;
};

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

export function useBarcodeScanner(options: UseBarcodeScannerOptions): void {
  const enabled = options.enabled ?? true;
  const onScanRef = useRef(options.onScan);
  const ignoreWhenRef = useRef(options.ignoreWhen);
  const minLengthRef = useRef(options.minLength ?? 6);
  const maxKeyIntervalRef = useRef(options.maxKeyIntervalMs ?? 35);
  const resetAfterRef = useRef(options.resetAfterMs ?? 120);

  onScanRef.current = options.onScan;
  ignoreWhenRef.current = options.ignoreWhen;
  minLengthRef.current = options.minLength ?? 6;
  maxKeyIntervalRef.current = options.maxKeyIntervalMs ?? 35;
  resetAfterRef.current = options.resetAfterMs ?? 120;

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef<number | null>(null);
  const totalIntervalRef = useRef(0);
  const intervalCountRef = useRef(0);
  const fastStreakRef = useRef(0);
  const editableTargetRef = useRef<EditableTarget | null>(null);
  const editableValueRef = useRef<string | null>(null);
  const pendingScanRef = useRef(false);

  useEffect(() => {
    const resetSequence = () => {
      bufferRef.current = "";
      lastKeyTimeRef.current = null;
      totalIntervalRef.current = 0;
      intervalCountRef.current = 0;
      fastStreakRef.current = 0;
      editableTargetRef.current = null;
      editableValueRef.current = null;
    };

    if (!enabled || typeof document === "undefined") {
      resetSequence();
      return;
    }

    const getEditableTarget = (target: EventTarget | null): EditableTarget | null => {
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return target;
      }

      if (target instanceof HTMLElement && target.isContentEditable) {
        return target;
      }

      return null;
    };

    const restoreEditableTarget = () => {
      const target = editableTargetRef.current;
      const value = editableValueRef.current;

      if (!target || value === null) {
        return;
      }

      if (target instanceof HTMLInputElement) {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
          target,
          value,
        );
        target.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (target instanceof HTMLTextAreaElement) {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(
          target,
          value,
        );
        target.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      target.textContent = value;
      target.dispatchEvent(new InputEvent("input", { bubbles: true }));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (ignoreWhenRef.current?.()) {
        resetSequence();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (pendingScanRef.current) {
        resetSequence();
        return;
      }

      const now = performance.now();
      const lastKeyTime = lastKeyTimeRef.current;

      if (lastKeyTime !== null && now - lastKeyTime > resetAfterRef.current) {
        resetSequence();
      }

      if (event.key === "Enter") {
        const buffer = bufferRef.current;
        const intervalCount = intervalCountRef.current;
        const averageInterval = intervalCount > 0 ? totalIntervalRef.current / intervalCount : 0;
        const isScan =
          buffer.length >= minLengthRef.current && averageInterval <= maxKeyIntervalRef.current;

        if (!isScan) {
          resetSequence();
          return;
        }

        const code = buffer.trim();
        event.preventDefault();
        event.stopPropagation();
        restoreEditableTarget();
        resetSequence();
        pendingScanRef.current = true;

        try {
          const scanResult = onScanRef.current(code);

          if (scanResult !== undefined) {
            void scanResult.then(
              () => {
                pendingScanRef.current = false;
              },
              () => {
                pendingScanRef.current = false;
              },
            );
          } else {
            pendingScanRef.current = false;
          }
        } catch (error) {
          pendingScanRef.current = false;
          throw error;
        }

        return;
      }

      if (event.key.length !== 1) {
        resetSequence();
        return;
      }

      if (bufferRef.current.length === 0) {
        const editableTarget = getEditableTarget(event.target);

        editableTargetRef.current = editableTarget;
        editableValueRef.current = editableTarget
          ? editableTarget instanceof HTMLInputElement ||
            editableTarget instanceof HTMLTextAreaElement
            ? editableTarget.value
            : (editableTarget.textContent ?? "")
          : null;
        bufferRef.current = event.key;
        lastKeyTimeRef.current = now;
        return;
      }

      const interval = lastKeyTimeRef.current === null ? 0 : now - lastKeyTimeRef.current;
      totalIntervalRef.current += interval;
      intervalCountRef.current += 1;
      bufferRef.current += event.key;
      lastKeyTimeRef.current = now;

      if (interval <= maxKeyIntervalRef.current) {
        fastStreakRef.current += 1;
      } else {
        fastStreakRef.current = 0;
      }

      if (fastStreakRef.current >= 1) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      resetSequence();
    };
  }, [enabled]);
}
