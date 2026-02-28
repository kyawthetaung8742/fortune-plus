import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shareholderApi } from "@/api/shareholder";
import { paymentApi } from "@/api/payment";
import type { Shareholder, Payment } from "@/types/app";
import { toast } from "sonner";

const Exchange = () => {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  type ExchangeDirection = "kyat_to_baht" | "baht_to_kyat";

  const [form, setForm] = useState({
    shareholder_id: "",
    direction: "kyat_to_baht" as ExchangeDirection,
    from_payment_id: "",
    to_shareholder_id: "",
    to_payment_id: "",
    from_amount: "",
    rate: "",
    receive_amount: "",
    note: "",
  });

  const kyatPayments = payments.filter(
    (p) => (p.currency_type || "").toLowerCase() === "kyat"
  );
  const bahtPayments = payments.filter(
    (p) => (p.currency_type || "").toLowerCase() === "baht"
  );
  const fromPayments = form.direction === "kyat_to_baht" ? kyatPayments : bahtPayments;
  const toPayments = form.direction === "kyat_to_baht" ? bahtPayments : kyatPayments;

  const fromAmountNum = parseFloat(form.from_amount);
  const bahtRateNum = parseFloat(form.rate);
  const isValidRate = !isNaN(bahtRateNum) && bahtRateNum > 0;
  const calculatedToAmount =
    isValidRate && !isNaN(fromAmountNum) && fromAmountNum > 0
      ? form.direction === "kyat_to_baht"
        ? fromAmountNum / bahtRateNum
        : fromAmountNum * bahtRateNum
      : null;
  const toCurrencyLabel = form.direction === "kyat_to_baht" ? "Baht" : "Kyat";

  useEffect(() => {
    if (calculatedToAmount != null) {
      setForm((f) => ({
        ...f,
        receive_amount: calculatedToAmount.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      }));
    } else {
      setForm((f) => ({ ...f, receive_amount: "" }));
    }
  }, [form.from_amount, form.rate, form.direction, calculatedToAmount]);

  useEffect(() => {
    const load = async () => {
      try {
        const [shRes, pRes] = await Promise.all([
          shareholderApi.list(),
          paymentApi.list(),
        ]);
        if (shRes.data.success && shRes.data.data) setShareholders(shRes.data.data);
        if (pRes.data.success && pRes.data.data) setPayments(pRes.data.data);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.shareholder_id ||
      !form.from_payment_id ||
      !form.to_shareholder_id ||
      !form.to_payment_id ||
      !form.from_amount ||
      !form.receive_amount
    ) {
      toast.error("Select from/to shareholder, from/to payment, and enter amount and receive amount");
      return;
    }
    if (form.from_payment_id === form.to_payment_id) {
      toast.error("From and to payment must be different (e.g. Kyat ↔ Baht)");
      return;
    }
    const fromAmount = parseFloat(form.from_amount);
    const receiveAmount = parseFloat(String(form.receive_amount).replace(/,/g, ""));
    if (isNaN(fromAmount) || fromAmount <= 0 || isNaN(receiveAmount) || receiveAmount <= 0) {
      toast.error("Enter valid amount and receive amount");
      return;
    }
    const apiRate = fromAmount / receiveAmount;
    try {
      const res = await shareholderApi.exchange(form.shareholder_id, {
        from_payment_id: form.from_payment_id,
        to_payment_id: form.to_payment_id,
        to_shareholder_id: form.to_shareholder_id || undefined,
        from_amount: fromAmount,
        rate: apiRate,
        note: form.note || undefined,
      });
      const toAmount = res.data?.data?.to_amount;
      toast.success(
        toAmount != null
          ? `Exchange completed. Received ${Number(toAmount).toLocaleString()}`
          : "Exchange completed"
      );
      setForm((f) => ({
        ...f,
        from_amount: "",
        rate: "",
        receive_amount: "",
        note: "",
      }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Exchange failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Currency Exchange (Myanmar Kyat ↔ Thai Baht)</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Perform exchange</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Direction</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    checked={form.direction === "kyat_to_baht"}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        direction: "kyat_to_baht",
                        from_payment_id: "",
                        to_payment_id: "",
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Kyat to Baht</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    checked={form.direction === "baht_to_kyat"}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        direction: "baht_to_kyat",
                        from_payment_id: "",
                        to_payment_id: "",
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Baht to Kyat</span>
                </label>
              </div>
            </div>
            <div>
              <Label>From Shareholder</Label>
              <select
                value={form.shareholder_id}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({
                    ...f,
                    shareholder_id: v,
                    to_shareholder_id: v || f.to_shareholder_id,
                  }));
                }}
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select shareholder —</option>
                {shareholders.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>From payment (currency to deduct)</Label>
              <select
                value={form.from_payment_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    from_payment_id: e.target.value,
                    to_payment_id:
                      e.target.value === f.to_payment_id ? "" : f.to_payment_id,
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select {form.direction === "kyat_to_baht" ? "Kyat" : "Baht"} payment —</option>
                {fromPayments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>To Shareholder</Label>
              <select
                value={form.to_shareholder_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, to_shareholder_id: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select shareholder —</option>
                {shareholders.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>To payment (currency to receive)</Label>
              <select
                value={form.to_payment_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    to_payment_id: e.target.value,
                    from_payment_id:
                      e.target.value === f.from_payment_id ? "" : f.from_payment_id,
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select {form.direction === "kyat_to_baht" ? "Baht" : "Kyat"} payment —</option>
                {toPayments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="exchange-from-amount">Amount (from currency)</Label>
              <Input
                id="exchange-from-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.from_amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, from_amount: e.target.value }))
                }
                required
                className="mt-1"
                placeholder="e.g. 1000"
              />
            </div>
            <div>
              <Label htmlFor="exchange-rate">
                1 Baht = ? Kyat
              </Label>
              <Input
                id="exchange-rate"
                type="number"
                step="0.01"
                min="0.01"
                value={form.rate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rate: e.target.value }))
                }
                required
                className="mt-1"
                placeholder="e.g. 128"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter how many Kyat equal 1 Baht (e.g. 128).
              </p>
            </div>
            <div>
              <Label htmlFor="exchange-receive-amount">
                Receive amount ({toCurrencyLabel})
              </Label>
              <Input
                id="exchange-receive-amount"
                type="text"
                inputMode="decimal"
                value={form.receive_amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, receive_amount: e.target.value }))
                }
                className="mt-1"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculated from amount and rate. You can edit this value.
              </p>
            </div>
            <div>
              <Label htmlFor="exchange-note">Note</Label>
              <Input
                id="exchange-note"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <Button type="submit">Exchange</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exchange;
