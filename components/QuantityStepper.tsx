"use client";

export function QuantityStepper({
  value,
  max,
  name,
  onChange,
}: {
  value: number;
  max: number;
  name: string;
  onChange: (q: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-cloud" role="group" aria-label={`Quantity for ${name}`}>
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full text-[20px] text-ink hover:bg-cloud-strong disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        aria-label={value === 1 ? `Remove ${name}` : `Decrease quantity of ${name}`}
      >
        −
      </button>
      <span className="min-w-8 text-center text-[16px] font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full text-[20px] text-ink hover:bg-cloud-strong disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${name}`}
      >
        +
      </button>
    </div>
  );
}
