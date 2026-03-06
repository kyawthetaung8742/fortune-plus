import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shareholderApi } from "@/api/shareholder";
import { paymentApi } from "@/api/payment";
import { exchangeRateApi } from "@/api/exchangeRate";
import type { Shareholder, Payment } from "@/types/app";
import { toast } from "sonner";

const Exchange = () => {
  const navigate = useNavigate();
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exchangeRates, setExchangeRates] = useState<
    { type: string; rate: number }[]
  >([]);
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
    (p) => (p.currency_type || "").toLowerCase() === "kyat",
  );
  const bahtPayments = payments.filter(
    (p) => (p.currency_type || "").toLowerCase() === "baht",
  );
  const fromPayments =
    form.direction === "kyat_to_baht" ? kyatPayments : bahtPayments;
  const toPayments =
    form.direction === "kyat_to_baht" ? bahtPayments : kyatPayments;

  const fromAmountNum = parseFloat(form.from_amount);
  const transferAmountNum = parseFloat(
    String(form.receive_amount).replace(/,/g, ""),
  );
  const bahtRateNum = parseFloat(form.rate);
  const isValidRate = !isNaN(bahtRateNum) && bahtRateNum > 0;
  const calculatedToAmount =
    isValidRate && !isNaN(fromAmountNum) && fromAmountNum > 0
      ? form.direction === "kyat_to_baht"
        ? fromAmountNum / bahtRateNum
        : fromAmountNum * bahtRateNum
      : null;
  // When user enters Transfer amount → calculated Receive amount (for display below transfer input)
  const calculatedReceiveFromTransfer =
    isValidRate && !isNaN(transferAmountNum) && transferAmountNum > 0
      ? form.direction === "kyat_to_baht"
        ? transferAmountNum * bahtRateNum
        : transferAmountNum / bahtRateNum
      : null;
  // Kyat to Baht = we Receive Kyat, Transfer Baht (and vice versa for Baht to Kyat)
  const receiveCurrencyLabel =
    form.direction === "kyat_to_baht" ? "Kyat" : "Baht";
  const transferCurrencyLabel =
    form.direction === "kyat_to_baht" ? "Baht" : "Kyat";

  useEffect(() => {
    if (calculatedToAmount != null) {
      setForm((f) => ({
        ...f,
        receive_amount: calculatedToAmount.toLocaleString(undefined, {
          maximumFractionDigits: 4,
        }),
      }));
    } else {
      setForm((f) => ({ ...f, receive_amount: "" }));
    }
  }, [form.from_amount, form.rate, form.direction, calculatedToAmount]);

  useEffect(() => {
    const load = async () => {
      try {
        const [shRes, pRes, rateRes] = await Promise.all([
          shareholderApi.list(),
          paymentApi.list(),
          exchangeRateApi.list(),
        ]);
        if (shRes.data.success && shRes.data.data)
          setShareholders(shRes.data.data);
        if (pRes.data.success && pRes.data.data) setPayments(pRes.data.data);
        if (rateRes.data.success && rateRes.data.data)
          setExchangeRates(
            rateRes.data.data.map((r) => ({ type: r.type, rate: r.rate })),
          );
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (exchangeRates.length === 0) return;
    const rateEntry =
      form.direction === "kyat_to_baht"
        ? exchangeRates.find((r) => r.type === "kyat_to_baht")
        : exchangeRates.find((r) => r.type === "baht_to_kyat");
    if (rateEntry) setForm((f) => ({ ...f, rate: String(rateEntry.rate) }));
  }, [form.direction, exchangeRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.shareholder_id ||
      !form.from_payment_id ||
      !form.to_shareholder_id ||
      !form.to_payment_id ||
      !form.receive_amount
    ) {
      toast.error(
        "Select Receive and Transfer shareholder/payment, and enter at least transfer amount (or both amounts)",
      );
      return;
    }
    if (form.from_payment_id === form.to_payment_id) {
      toast.error(
        "Receive and Transfer payment must be different (e.g. Kyat ↔ Baht)",
      );
      return;
    }
    // form.from_amount = Receive amount (we receive from customer), form.receive_amount = Transfer amount (we give to customer)
    const transferAmount = parseFloat(
      String(form.receive_amount).replace(/,/g, ""),
    );
    let receiveAmount = parseFloat(form.from_amount);
    // If user entered only Transfer amount, use calculated receive amount
    if (isNaN(receiveAmount) || receiveAmount <= 0) {
      const rateNum = parseFloat(form.rate);
      if (
        !isNaN(rateNum) &&
        rateNum > 0 &&
        !isNaN(transferAmount) &&
        transferAmount > 0
      ) {
        receiveAmount =
          form.direction === "kyat_to_baht"
            ? transferAmount * rateNum
            : transferAmount / rateNum;
      }
    }
    if (
      isNaN(receiveAmount) ||
      receiveAmount <= 0 ||
      isNaN(transferAmount) ||
      transferAmount <= 0
    ) {
      toast.error("Enter valid receive amount and/or transfer amount");
      return;
    }
    // Backend: from_amount = we deduct (Transfer), to_amount = we add (Receive). rate = from_amount / to_amount
    const apiRate = transferAmount / receiveAmount;
    try {
      // Backend: from = Transfer (deduct), to = Receive (add)
      const res = await shareholderApi.exchange(form.to_shareholder_id, {
        from_payment_id: form.to_payment_id,
        to_payment_id: form.from_payment_id,
        to_shareholder_id: form.shareholder_id,
        from_amount: transferAmount,
        rate: apiRate,
        note: form.note || undefined,
      });
      const toAmount = res.data?.data?.to_amount;
      toast.success(
        toAmount != null
          ? `Exchange completed. Received ${Number(toAmount).toLocaleString()}`
          : "Exchange completed",
      );
      setForm((f) => ({
        ...f,
        from_amount: "",
        rate: "",
        receive_amount: "",
        note: "",
      }));
      navigate("/transaction-history");
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
      <h1 className="text-2xl font-semibold">
        Currency Exchange (Myanmar Kyat ↔ Thai Baht)
      </h1>

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
              <Label>Receive - Shareholder</Label>
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
              <Label>Receive - Payment</Label>
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
                <option value="">
                  — Select {form.direction === "kyat_to_baht" ? "Kyat" : "Baht"}{" "}
                  payment (we receive) —
                </option>
                {fromPayments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Transfer - Shareholder</Label>
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
              <Label>Transfer - Payment</Label>
              <select
                value={form.to_payment_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    to_payment_id: e.target.value,
                    from_payment_id:
                      e.target.value === f.from_payment_id
                        ? ""
                        : f.from_payment_id,
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">
                  — Select {form.direction === "kyat_to_baht" ? "Baht" : "Kyat"}{" "}
                  payment (we transfer) —
                </option>
                {toPayments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="exchange-from-amount">
                Receive Amount ({receiveCurrencyLabel}) — from customer
              </Label>
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
              <Label htmlFor="exchange-rate">1 Baht = ? Kyat</Label>
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
                Transfer Amount ({transferCurrencyLabel}) — to customer
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
              {calculatedReceiveFromTransfer != null && (
                <p className="text-sm font-medium mt-2 text-muted-foreground">
                  Receive amount:{" "}
                  <span className="text-foreground">
                    {calculatedReceiveFromTransfer.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}{" "}
                    {receiveCurrencyLabel}
                  </span>
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Enter receive or transfer amount; the other is calculated from
                rate.
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
