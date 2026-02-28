import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { walletApi, type WalletSummary } from "@/api/wallet";
import { toast } from "sonner";

const cardClassName = "bg-[#092b5d] text-white border-[#1e3a5f]";

const Dashboard = () => {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-semibold">Wallet Report</h1>

      {/* Overall amount — one card */}
      <section>
        <h2 className="text-lg font-medium mb-4">Overall amount</h2>
        <Card className={`${cardClassName} max-w-md`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white">
              Total by payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary?.byPayment?.map((p) => (
              <div key={p.payment_id} className="flex justify-between text-sm">
                <span className="text-white/80">
                  {p.paymentName} ({p.currency_type})
                </span>
                <span className="font-medium">
                  {Number(p.totalAmount).toLocaleString()}
                </span>
              </div>
            ))}
            {!summary?.byPayment?.length && (
              <p className="text-sm text-white/60">No payment totals yet.</p>
            )}
            {currencyEntries.length > 0 && (
              <>
                <div className="border-t border-white/20 my-3" />
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-white/60 uppercase tracking-wide">
                    Total by currency
                  </p>
                  {currencyEntries.map(([currencyType, total]) => (
                    <div
                      key={currencyType}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-white/80 capitalize">
                        {currencyType}
                      </span>
                      <span className="font-medium">
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
            <Card key={sh.shareholder_id} className={cardClassName}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-white">
                  {sh.shareholderName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sh.wallets?.map((w) => (
                  <div
                    key={w.payment_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-white/80">
                      {w.paymentName} ({w.currency_type})
                    </span>
                    <span className="font-medium">
                      {Number(w.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                {!sh.wallets?.length && (
                  <p className="text-sm text-white/60">No balance</p>
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
                        <div className="border-t border-white/20 my-3" />
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs text-white/60 uppercase tracking-wide">
                            Total by currency
                          </p>
                          {totalEntries.map(([currencyType, total]) => (
                            <div
                              key={currencyType}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-white/80 capitalize">
                                {currencyType}
                              </span>
                              <span className="font-medium">
                                {Number(total).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2 pt-2">
                          <p className="text-xs text-white/60 uppercase tracking-wide">
                            Deposit / Withdraw / Remain by currency
                          </p>
                          {entries.map((currencyType) => {
                            const deposit = Number(
                              depositByCurrency[currencyType] ?? 0,
                            );
                            const withdraw = Number(
                              withdrawByCurrency[currencyType] ?? 0,
                            );
                            return (
                              <div
                                key={currencyType}
                                className="text-sm space-y-0.5 rounded px-2 py-1.5 bg-white/5"
                              >
                                <div className="flex justify-between">
                                  <span className="text-white/80 capitalize font-medium">
                                    {currencyType}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs pl-1">
                                  <span className="text-white/60">Deposit</span>
                                  <span>{deposit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs pl-1">
                                  <span className="text-white/60">
                                    Withdraw
                                  </span>
                                  <span>{withdraw.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs pl-1">
                                  <span className="text-white/60">Remain</span>
                                  <span className="font-medium">
                                    {deposit - withdraw}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
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
    </div>
  );
};

export default Dashboard;
