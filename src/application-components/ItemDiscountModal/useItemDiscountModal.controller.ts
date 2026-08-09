import { round2 } from "@/uperp/common/formulas/saleFormulas";
import { CartSaleItem, DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { useEffect, useState } from "react";

export type ItemDiscountModalControllerProps = {
  open: boolean;
  item: CartSaleItem | null;
  onApply: (item: CartSaleItem, discount: DiscountInfo) => void;
  onRemove: (item: CartSaleItem) => void;
};

type LastEdited = "%" | "R$" | null;

export function useItemDiscountModalController({
  open,
  item,
  onApply,
  onRemove,
}: ItemDiscountModalControllerProps) {
  const [percentInput, setPercentInput] = useState<number | null>(null);
  const [valueInput, setValueInput] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [lastEdited, setLastEdited] = useState<LastEdited>(null);

  const effectivePrice = item?.isEspecialPrice
    ? Number(item.internCustomerPrice?.specialPrice ?? 0)
    : Number(item?.productEspecification.salePrice ?? 0);

  const quantity = Number(item?.quantitySold ?? 0);
  const lineTotal = effectivePrice * quantity;
  const maxDiscount = lineTotal;

  const currentValue = valueInput ?? 0;
  const totalAfterDiscount = Math.max(lineTotal - currentValue, 0);

  useEffect(() => {
    if (open && item) {
      const existing = item.discountInfo;
      if (existing?.value) {
        setValueInput(existing.value);
        setPercentInput(existing.percent ?? round2((existing.value / lineTotal) * 100));
        setReason(existing.reason ?? "");
        setLastEdited(null);
      } else {
        setPercentInput(null);
        setValueInput(null);
        setReason("");
        setLastEdited(null);
      }
    }
  }, [open, item, lineTotal]);

  const handlePercentChange = (v: number | null) => {
    if (v != null && (v < 0 || v > 100)) return;
    setPercentInput(v);
    if (v != null) {
      setValueInput(round2((v / 100) * lineTotal));
    } else {
      setValueInput(null);
    }
    setLastEdited("%");
  };

  const handleValueChange = (v: number | null) => {
    setValueInput(v);
    if (v != null && lineTotal > 0) {
      setPercentInput(round2((v / lineTotal) * 100));
    } else {
      setPercentInput(null);
    }
    setLastEdited("R$");
  };

  const handleApply = () => {
    if (!item) return;
    if (currentValue > maxDiscount) return;

    onApply(item, {
      value: currentValue > 0 ? currentValue : undefined,
      percent: percentInput && percentInput > 0 ? percentInput : undefined,
      reason: reason.trim() || undefined,
    });
  };

  const handleRemove = () => {
    if (!item) return;
    onRemove(item);
  };

  return {
    handleRemove,
    handleApply,
    effectivePrice,
    quantity,
    lineTotal,
    maxDiscount,
    valueInput,
    handleValueChange,
    setLastEdited,
    percentInput,
    handlePercentChange,
    reason,
    setReason,
    totalAfterDiscount,
  };
}
