import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  transactionHistoryApi,
  type TransactionHistoryListParams,
} from "@/api/transactionHistory";
import { shareholderApi } from "@/api/shareholder";
import type { TransactionHistory } from "@/types/app";
import type { Shareholder } from "@/types/app";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PopulatedShareholder = { _id: string; name?: string; phone?: string; email?: string };
type PopulatedPayment = { _id: string; name?: string; currency_type?: string };

type TransactionRow = Omit<TransactionHistory, "shareholder_id" | "payment_id"> & {
  shareholder_id: string | PopulatedShareholder;
  payment_id: string | PopulatedPayment;
};

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState<TransactionHistoryListParams>({
    page: 1,
    limit: 20,
  });
  const [filterForm, setFilterForm] = useState({
    transaction_number: "",
    from: "",
    to: "",
    shareholder_id: "",
    transaction_type: "",
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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: TransactionHistoryListParams = {
        page: queryParams.page,
        limit: queryParams.limit,
      };
      if (queryParams.transaction_number) params.transaction_number = queryParams.transaction_number;
      if (queryParams.from) params.from = queryParams.from;
      if (queryParams.to) params.to = queryParams.to;
      if (queryParams.shareholder_id) params.shareholder_id = queryParams.shareholder_id;
      if (queryParams.transaction_type) params.transaction_type = queryParams.transaction_type;

      const res = await transactionHistoryApi.list(params);
      if (res.data.success && res.data.data) {
        setTransactions(res.data.data as TransactionRow[]);
        setTotal(res.data.total);
        setPage(res.data.page);
        setLimit(res.data.limit);
        setTotalPages(res.data.totalPages);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  }, [
    queryParams.page,
    queryParams.limit,
    queryParams.transaction_number,
    queryParams.from,
    queryParams.to,
    queryParams.shareholder_id,
    queryParams.transaction_type,
  ]);

  useEffect(() => {
    fetchShareholders();
  }, [fetchShareholders]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      transaction_number: filterForm.transaction_number.trim() || undefined,
      from: filterForm.from || undefined,
      to: filterForm.to || undefined,
      shareholder_id: filterForm.shareholder_id || undefined,
      transaction_type: filterForm.transaction_type || undefined,
      page: 1,
      limit: prev.limit ?? 20,
    }));
  };

  const transactionTypeOptions: { value: string; label: string }[] = [
    { value: "", label: "All types" },
    { value: "deposit", label: "Deposit" },
    { value: "withdraw", label: "Withdraw" },
    { value: "transfer", label: "Transfer" },
    { value: "receive", label: "Receive" },
    { value: "buy", label: "Buy" },
    { value: "exchange_out", label: "Exchange Out" },
    { value: "exchange_in", label: "Exchange In" },
    { value: "expense", label: "Expense" },
    { value: "expense_reversal", label: "Expense Reversal" },
    { value: "product_sale", label: "Product Sale" },
  ];

  const columns: ColumnDef<TransactionRow>[] = [
    {
      accessorKey: "transaction_number",
      header: "Transaction #",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        row.original.date
          ? new Date(row.original.date).toLocaleString()
          : "",
    },
    {
      id: "shareholder",
      header: "Shareholder",
      cell: ({ row }) => {
        const sh = row.original.shareholder_id;
        if (typeof sh === "object" && sh && "name" in sh) return (sh as PopulatedShareholder).name ?? "";
        return String(sh);
      },
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const p = row.original.payment_id;
        if (typeof p === "object" && p && "name" in p) {
          const pay = p as PopulatedPayment;
          return `${pay.name ?? ""} (${pay.currency_type ?? ""})`;
        }
        return String(p);
      },
    },
    {
      accessorKey: "transaction_type",
      header: "Type",
    },
    {
      accessorKey: "before_amount",
      header: "Before",
      cell: ({ row }) => Number(row.original.before_amount).toLocaleString(),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => Number(row.original.amount).toLocaleString(),
    },
    {
      accessorKey: "after_amount",
      header: "After",
      cell: ({ row }) => Number(row.original.after_amount).toLocaleString(),
    },
    {
      accessorKey: "note",
      header: "Note",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transaction History</h1>

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-muted/30">
        <div>
          <Label htmlFor="filter-transaction_number">Transaction #</Label>
          <Input
            id="filter-transaction_number"
            type="text"
            placeholder="Search by number"
            className="mt-1 w-[180px]"
            value={filterForm.transaction_number}
            onChange={(e) =>
              setFilterForm((prev) => ({
                ...prev,
                transaction_number: e.target.value,
              }))
            }
          />
        </div>
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
              "bg-background"
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
        <div>
          <Label htmlFor="filter-transaction_type">Transaction Type</Label>
          <select
            id="filter-transaction_type"
            className={cn(
              "mt-1 w-[180px] border rounded-md px-3 py-2 text-sm",
              "bg-background"
            )}
            value={filterForm.transaction_type}
            onChange={(e) =>
              setFilterForm((prev) => ({
                ...prev,
                transaction_type: e.target.value,
              }))
            }
          >
            {transactionTypeOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleApplyFilters}>Apply</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable columns={columns} data={transactions} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total}
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

export default TransactionHistoryPage;
