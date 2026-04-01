import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { walletApi, type WalletSummary } from "@/api/wallet";
import { exchangeRateApi } from "@/api/exchangeRate";
import type { ExchangeRate } from "@/types/app";
import { toast } from "sonner";

const typeLabels: Record<ExchangeRate["type"], string> = {
  kyat_to_baht: "Kyat to Baht Price",
  baht_to_kyat: "Baht to Kyat Price",
};

const Dashboard = () => {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await walletApi.summary();
        if (res.data.success && res.data.data) setSummary(res.data.data);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load wallet report",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await exchangeRateApi.list();
        if (res.data.success && res.data.data) setExchangeRates(res.data.data);
      } catch {
        // ignore
      }
    };
    fetchRates();
  }, []);

  const openEdit = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setEditValue(String(rate.rate));
    setEditOpen(true);
  };

  const handleSaveRate = async () => {
    if (!editingRate) return;
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) {
      toast.error("Enter a valid rate");
      return;
    }
    try {
      const res = await exchangeRateApi.update(editingRate._id, { rate: num });
      if (res.data.success && res.data.data) {
        setExchangeRates((prev) =>
          prev.map((r) => (r._id === res.data.data._id ? res.data.data : r)),
        );
        toast.success("Rate updated");
        setEditOpen(false);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  const totalByCurrency = (summary?.byPayment ?? []).reduce(
    (acc, p) => {
      const type = (p.currency_type || "").toLowerCase();
      if (!type) return acc;
      acc[type] = (acc[type] ?? 0) + Number(p.totalAmount);
      return acc;
    },
    {} as Record<string, number>,
  );
  const currencyEntries = Object.entries(totalByCurrency);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard Report</h1>

      {/* Exchange rates — single card */}
      {exchangeRates.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-4">Exchange rates</h2>
          <Card className="max-w-md text-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-black">
                Exchange rates for Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-black">
              {exchangeRates.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between gap-2 py-1"
                >
                  <span className="text-sm text-black">
                    {typeLabels[r.type]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black">{r.rate}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-black hover:bg-black/10 hover:text-black"
                      onClick={() => openEdit(r)}
                    >
                      <Icons.pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Overall amount — one card */}
      <section>
        <h2 className="text-lg font-medium mb-4">Overall amount</h2>
        <Card className="max-w-md text-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-black">
              Total by payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-black">
            {summary?.byPayment?.map((p) => (
              <div key={p.payment_id} className="flex justify-between text-sm">
                <span className="text-black">
                  {p.paymentName} ({p.currency_type})
                </span>
                <span className="font-medium text-black">
                  {Number(p.totalAmount).toLocaleString()}
                </span>
              </div>
            ))}
            {!summary?.byPayment?.length && (
              <p className="text-sm text-black">No payment totals yet.</p>
            )}
            {currencyEntries.length > 0 && (
              <>
                <div className="border-t border-border my-3" />
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-black uppercase tracking-wide">
                    Total by currency
                  </p>
                  {currencyEntries.map(([currencyType, total]) => (
                    <div
                      key={currencyType}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-black capitalize">
                        {currencyType}
                      </span>
                      <span className="font-medium text-black">
                        {Number(total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Shareholder amount by payment — one card per shareholder */}
      <section>
        <h2 className="text-lg font-medium mb-4">
          Shareholder balance by payment
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary?.byShareholder?.map((sh) => (
            <Card key={sh.shareholder_id} className="text-black">
              <CardHeader>
                <CardTitle className="text-base font-medium text-black">
                  {sh.shareholderName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-black">
                {sh.wallets?.map((w) => (
                  <div
                    key={w.payment_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-black">
                      {w.paymentName} ({w.currency_type})
                    </span>
                    <span className="font-medium text-black">
                      {Number(w.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                {!sh.wallets?.length && (
                  <p className="text-sm text-black">No balance</p>
                )}
                {(sh.wallets?.length ?? 0) > 0 &&
                  (() => {
                    const remainByCurrency = (sh.wallets ?? []).reduce(
                      (acc, w) => {
                        const type = (w.currency_type || "").toLowerCase();
                        if (!type) return acc;
                        acc[type] = (acc[type] ?? 0) + Number(w.amount);
                        return acc;
                      },
                      {} as Record<string, number>,
                    );
                    const depositByCurrency = sh.depositByCurrency ?? {};
                    const withdrawByCurrency = sh.withdrawByCurrency ?? {};
                    const currencyTypes = new Set([
                      ...Object.keys(remainByCurrency),
                      ...Object.keys(depositByCurrency),
                      ...Object.keys(withdrawByCurrency),
                    ]);
                    const totalEntries = Object.entries(remainByCurrency);
                    const entries = Array.from(currencyTypes).filter(Boolean);
                    if (entries.length === 0) return null;
                    return (
                      <>
                        <div className="border-t border-border my-3" />
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs text-black uppercase tracking-wide">
                            Total by currency
                          </p>
                          {totalEntries.map(([currencyType, total]) => (
                            <div
                              key={currencyType}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-black capitalize">
                                {currencyType}
                              </span>
                              <span className="font-medium text-black">
                                {Number(total).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-black uppercase tracking-wide mb-2">
                            Deposit / Withdraw
                          </p>
                          <div className="rounded-md overflow-hidden border border-border">
                            <table className="w-full text-sm text-black">
                              <thead>
                                <tr className="bg-muted/50 text-left">
                                  <th className="px-2 py-1.5 text-black font-medium capitalize">
                                    Currency
                                  </th>
                                  <th className="px-2 py-1.5 text-black font-medium">
                                    Deposit
                                  </th>
                                  <th className="px-2 py-1.5 text-black font-medium">
                                    Withdraw
                                  </th>
                                  <th className="px-2 py-1.5 text-black font-medium">
                                    Remain
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {entries.map((currencyType) => {
                                  const deposit = Number(
                                    depositByCurrency[currencyType] ?? 0,
                                  );
                                  const withdraw = Number(
                                    withdrawByCurrency[currencyType] ?? 0,
                                  );
                                  return (
                                    <tr
                                      key={currencyType}
                                      className="border-t border-border bg-muted/20"
                                    >
                                      <td className="px-2 py-1.5 text-black capitalize font-medium">
                                        {currencyType}
                                      </td>
                                      <td className="px-2 py-1.5 text-black">
                                        {deposit.toLocaleString()}
                                      </td>
                                      <td className="px-2 py-1.5 text-black">
                                        {withdraw.toLocaleString()}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium text-black">
                                        {(deposit - withdraw).toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
              </CardContent>
            </Card>
          ))}
          {!summary?.byShareholder?.length && (
            <p className="text-muted-foreground col-span-full">
              No shareholder wallets yet.
            </p>
          )}
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Edit rate
              {editingRate && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {typeLabels[editingRate.type]}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-rate">Rate</Label>
              <Input
                id="edit-rate"
                type="number"
                min="0"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
