import { productApi } from "@/api/product";
import lotteryCellBg from "@/assets/images/lottery.png";
import { getDigitWordPairs, getLastTwoDigits } from "@/lib/lottery";
import type { Product } from "@/types/app";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const getCategoryName = (product: Product): string => {
  const category = product.category_id;
  if (typeof category === "object" && category?.name) {
    return category.name;
  }
  return "";
};

const getDefaultStartDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = today.getDate() <= 16 ? "01" : "17";
  return `${year}-${month}-${day}`;
};

type StockFilter = "all" | "soldout" | "not_soldout";

const LotteryList = () => {
  const [loading, setLoading] = useState(true);
  const [lotteryProducts, setLotteryProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [productNameFilter, setProductNameFilter] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.list();
        if (res.data.success && res.data.data) {
          const onlyLottery = res.data.data
            .filter((product) =>
              getCategoryName(product).toLowerCase().includes("lottery"),
            )
            .sort(
              (a, b) => getLastTwoDigits(a.name) - getLastTwoDigits(b.name),
            );
          setLotteryProducts(onlyLottery);
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load lottery list",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = lotteryProducts.filter((product) => {
    const productDate = new Date(product.createdAt);
    const filterStartDate = new Date(`${startDate}T00:00:00`);
    const passDateFilter = Number.isNaN(productDate.getTime())
      ? true
      : productDate >= filterStartDate;

    const isSoldOut = product.quantity === 0;
    const passStockFilter =
      stockFilter === "all" ||
      (stockFilter === "soldout" && isSoldOut) ||
      (stockFilter === "not_soldout" && !isSoldOut);

    const passProductNameFilter = product.name
      .toLowerCase()
      .includes(productNameFilter.trim().toLowerCase());

    return passDateFilter && passStockFilter && passProductNameFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lottery List</h1>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Product Name</label>
          <input
            type="text"
            value={productNameFilter}
            onChange={(e) => setProductNameFilter(e.target.value)}
            placeholder="Search product..."
            className="h-9 rounded-md border px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-md border px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Stock Filter</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="h-9 rounded-md border px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="soldout">Soldout</option>
            <option value="not_soldout">Not Soldout</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-muted-foreground">No lottery products found.</p>
      ) : (
        <div className="w-full rounded-md p-2">
          <div
            className="grid justify-start gap-0"
            style={{ gridTemplateColumns: "repeat(auto-fill,440px)" }}
          >
            {filteredProducts.map((product) => {
              const pairs = getDigitWordPairs(product.name);
              const isSoldOut = product.quantity === 0;
              return (
                <div
                  key={product._id}
                  className="relative h-20 flex flex-col items-end py-2 px-1 bg-center bg-cover bg-no-repeat"
                  style={{ backgroundImage: `url(${lotteryCellBg})` }}
                >
                  {/* {!isSoldOut && (
                    <span className="absolute left-0 top-0 text-[10px] font-bold leading-none bg-red-900 text-white px-0.5 py-0 rounded-full">
                      {product.quantity}
                    </span>
                  )} */}
                  {isSoldOut && (
                    <img
                      src="/images/soldout.png"
                      alt="Sold out"
                      className="absolute inset-0 m-auto h-18 w-18 object-contain pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
                    />
                  )}
                  <div className="mr-18 flex flex-col items-end">
                    <div
                      className={`w-30 grid gap-4 justify-items-end text-3xl text-[#313133] z-10`}
                      style={{
                        gridTemplateColumns: `repeat(${pairs.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {pairs.map((item, index) => (
                        <span
                          key={`${product._id}-digit-${index}`}
                          className="text-right"
                        >
                          {item.digit}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`w-30 grid gap-4 justify-items-end text-[8px] font-bold uppercase leading-tight z-10`}
                      style={{
                        gridTemplateColumns: `repeat(${pairs.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {pairs.map((item, index) => (
                        <span
                          key={`${product._id}-word-${index}`}
                          className="text-right"
                        >
                          {item.word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LotteryList;
