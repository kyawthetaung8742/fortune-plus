import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Payment } from "@/types/app";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type PaymentSelectProps = {
  id?: string;
  value: string;
  onChange: (paymentId: string) => void;
  payments: Payment[];
  placeholder?: string;
  disabled?: boolean;
  /** When true, first item clears selection (value ""). */
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  triggerClassName?: string;
};

export function PaymentSelect({
  id,
  value,
  onChange,
  payments,
  placeholder = "Select payment",
  disabled,
  allowEmpty,
  emptyLabel = "— Select payment —",
  className,
  triggerClassName,
}: PaymentSelectProps) {
  const selected = payments.find((p) => p._id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-auto min-h-10 py-2 px-3",
            triggerClassName,
          )}
        >
          <span className="flex items-center gap-2 min-w-0 text-left">
            {selected?.logo_url ? (
              <img
                src={selected.logo_url}
                alt=""
                className="h-7 w-7 rounded object-contain shrink-0 bg-muted/50"
              />
            ) : (
              <span className="h-7 w-7 rounded bg-muted shrink-0" aria-hidden />
            )}
            <span className="truncate text-sm">
              {selected
                ? `${selected.name} (${selected.currency_type})`
                : placeholder}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[min(320px,70vh)] overflow-y-auto",
          className,
        )}
        align="start"
      >
        {allowEmpty && (
          <DropdownMenuItem
            onClick={() => onChange("")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="h-7 w-7 shrink-0" />
            <span className="text-muted-foreground">{emptyLabel}</span>
          </DropdownMenuItem>
        )}
        {payments.map((p) => (
          <DropdownMenuItem
            key={p._id}
            onClick={() => onChange(p._id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {p.logo_url ? (
              <img
                src={p.logo_url}
                alt=""
                className="h-7 w-7 rounded object-contain shrink-0 bg-muted/50"
              />
            ) : (
              <span className="h-7 w-7 rounded bg-muted shrink-0" />
            )}
            <span>
              {p.name} ({p.currency_type})
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
