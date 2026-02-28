import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  transactionHistoryApi,
  type ExchangeReportParams,
} from "@/api/transactionHistory";
import { shareholderApi } from "@/api/shareholder";
import type { TransactionHistory } from "@/types/app";
import type { Shareholder } from "@/types/app";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PopulatedShareholder = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
};
type PopulatedPayment = { _id: string; name?: string; currency_type?: string };

type TransactionRow = Omit<
  TransactionHistory,
  "shareholder_id" | "payment_id"
> & {
  shareholder_id: string | PopulatedShareholder;
  payment_id: string | PopulatedPayment;
};

const cardClassName = "bg-[#1f3069] text-white border-[#1e3a5f]";

const ExchangeReport = () => {
  const [data, setData] = useState<TransactionRow[]>([]);
  const [summary, setSummary] = useState<{
    exchange_out: Record<string, number>;
    exchange_in: Record<string, number>;
  }>({
    exchange_out: {},
    exchange_in: {},
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState<ExchangeReportParams>({
    page: 1,
    limit: 20,
  });
  const [filterForm, setFilterForm] = useState({
    from: "",
    to: "",
    shareholder_id: "",
  });
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);

  const fetchShareholders = useCallback(async () => {
    try {
      const res = await shareholderApi.list();
      if (res.data.success && res.data.data) setShareholders(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: ExchangeReportParams = {
        page: queryParams.page,
        limit: queryParams.limit,
      };
      if (queryParams.from) params.from = queryParams.from;
      if (queryParams.to) params.to = queryParams.to;
      if (queryParams.shareholder_id)
        params.shareholder_id = queryParams.shareholder_id;

      const res = await transactionHistoryApi.exchangeReport(params);
      if (res.data.success && res.data.data) {
        setData(res.data.data as TransactionRow[]);
        setTotal(res.data.total);
        setPage(res.data.page);
        setLimit(res.data.limit);
        setTotalPages(res.data.totalPages);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to load exchange report",
      );
    } finally {
      setLoading(false);
    }
  }, [
    queryParams.page,
    queryParams.limit,
    queryParams.from,
    queryParams.to,
    queryParams.shareholder_id,
  ]);

  useEffect(() => {
    fetchShareholders();
  }, [fetchShareholders]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      from: filterForm.from || undefined,
      to: filterForm.to || undefined,
      shareholder_id: filterForm.shareholder_id || undefined,
      page: 1,
      limit: prev.limit ?? 20,
    }));
  };

  const getShareholderName = (row: TransactionRow) => {
    const sh = row.shareholder_id;
    if (typeof sh === "object" && sh && "name" in sh)
      return (sh as PopulatedShareholder).name ?? "";
    return String(sh);
  };

  const getPaymentName = (row: TransactionRow) => {
    const p = row.payment_id;
    if (typeof p === "object" && p && "name" in p) {
      const pay = p as PopulatedPayment;
      return `${pay.name ?? ""} (${pay.currency_type ?? ""})`;
    }
    return String(p);
  };

  const columns: ColumnDef<TransactionRow>[] = [
    { accessorKey: "transaction_number", header: "Transaction #" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        row.original.date ? new Date(row.original.date).toLocaleString() : "",
    },
    {
      id: "shareholder",
      header: "Shareholder",
      cell: ({ row }) => getShareholderName(row.original),
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) => getPaymentName(row.original),
    },
    {
      accessorKey: "transaction_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.transaction_type.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => Number(row.original.amount).toLocaleString(),
    },
    { accessorKey: "note", header: "Note" },
  ];

  const exchangeOutEntries = Object.entries(summary.exchange_out).filter(
    ([, v]) => v > 0,
  );
  const exchangeInEntries = Object.entries(summary.exchange_in).filter(
    ([, v]) => v > 0,
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Exchange Report</h1>

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-muted/30">
        <div>
          <Label htmlFor="filter-from">Date From</Label>
          <Input
            id="filter-from"
            type="date"
            className="mt-1 w-[160px]"
            value={filterForm.from}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, from: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="filter-to">Date To</Label>
          <Input
            id="filter-to"
            type="date"
            className="mt-1 w-[160px]"
            value={filterForm.to}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="filter-shareholder">Shareholder</Label>
          <select
            id="filter-shareholder"
            className={cn(
              "mt-1 w-[180px] border rounded-md px-3 py-2 text-sm",
              "bg-background",
            )}
            value={filterForm.shareholder_id}
            onChange={(e) =>
              setFilterForm((prev) => ({
                ...prev,
                shareholder_id: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            {shareholders.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleApplyFilters}>Apply</Button>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card className={cardClassName}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white">
              Exchange Out (by currency)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {exchangeOutEntries.length > 0 ? (
              exchangeOutEntries.map(([currency, amount]) => (
                <div key={currency} className="flex justify-between text-sm">
                  <span className="text-white/80 capitalize">{currency}</span>
                  <span className="font-medium">
                    {Number(amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No data</p>
            )}
          </CardContent>
        </Card>
        <Card className={cardClassName}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white">
              Exchange In (by currency)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {exchangeInEntries.length > 0 ? (
              exchangeInEntries.map(([currency, amount]) => (
                <div key={currency} className="flex justify-between text-sm">
                  <span className="text-white/80 capitalize">{currency}</span>
                  <span className="font-medium">
                    {Number(amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No data</p>
            )}
          </CardContent>
        </Card>
      </section>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable columns={columns} data={data} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  setQueryParams((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setQueryParams((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                Next
              </Button>
              <select
                value={limit}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExchangeReport;
