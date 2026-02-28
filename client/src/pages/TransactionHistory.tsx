import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import { transactionHistoryApi } from "@/api/transactionHistory";
import type { TransactionHistory } from "@/types/app";
import { toast } from "sonner";

type PopulatedShareholder = { _id: string; name?: string; phone?: string; email?: string };
type PopulatedPayment = { _id: string; name?: string; currency_type?: string };

type TransactionRow = Omit<TransactionHistory, "shareholder_id" | "payment_id"> & {
  shareholder_id: string | PopulatedShareholder;
  payment_id: string | PopulatedPayment;
};

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await transactionHistoryApi.list();
        if (res.data.success && res.data.data) setTransactions(res.data.data as TransactionRow[]);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load transaction history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={transactions} />
      )}
    </div>
  );
};

export default TransactionHistoryPage;
