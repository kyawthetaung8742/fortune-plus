import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { categoryApi } from "@/api/category";
import { productApi } from "@/api/product";
import { customerApi } from "@/api/customer";
import { shareholderApi } from "@/api/shareholder";
import { paymentApi } from "@/api/payment";
import { saleListApi } from "@/api/saleList";
import { exchangeRateApi } from "@/api/exchangeRate";
import type { Category } from "@/types/app";
import type { Product } from "@/types/app";
import type { Customer } from "@/types/app";
import type { Shareholder } from "@/types/app";
import type { Payment } from "@/types/app";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CartItem = {
  product: Product;
  quantity: number;
};

const Sale = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [currencyType, setCurrencyType] = useState<"baht" | "kyat">("baht");
  const [kyatRate, setKyatRate] = useState("1");
  const [shareholderId, setShareholderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  const paymentsByCurrency = useMemo(
    () => payments.filter((p) => p.currency_type === currencyType),
    [payments, currencyType],
  );

  const saleCategories = useMemo(() => {
    const sale = categories.filter((c) => c.is_sale);
    return sale.length > 0 ? sale : categories;
  }, [categories]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.quantity > 0),
    [products],
  );

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return availableProducts;
    return availableProducts.filter(
      (p) =>
        (typeof p.category_id === "object" &&
          p.category_id?._id === selectedCategoryId) ||
        (typeof p.category_id === "string" &&
          p.category_id === selectedCategoryId),
    );
  }, [availableProducts, selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      if (res.data.success && res.data.data) setCategories(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.list({ available: true });
      if (res.data.success && res.data.data) setProducts(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.list();
      if (res.data.success && res.data.data) setCustomers(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load customers");
    }
  };

  const fetchShareholders = async () => {
    try {
      const res = await shareholderApi.list();
      if (res.data.success && res.data.data) setShareholders(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load shareholders");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await paymentApi.list();
      if (res.data.success && res.data.data) setPayments(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load payments");
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const res = await exchangeRateApi.list();
      if (res.data.success && res.data.data) {
        const kyatToBaht = res.data.data.find((r) => r.type === "kyat_to_baht");
        if (kyatToBaht != null) setKyatRate(String(kyatToBaht.rate));
      }
    } catch {
      // keep default kyatRate
    }
  };

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchCustomers(),
      fetchShareholders(),
      fetchPayments(),
      fetchExchangeRates(),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPaymentId("");
  }, [currencyType]);

  const addToCart = (product: Product) => {
    const inCart = cart.find((c) => c.product._id === product._id);
    const currentQty = inCart?.quantity ?? 0;
    if (currentQty >= product.quantity) {
      toast.error("No more quantity available");
      return;
    }
    if (inCart) {
      setCart((prev) =>
        prev.map((c) =>
          c.product._id === product._id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        ),
      );
    } else {
      setCart((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.product._id === productId);
      if (!item) return prev;
      const product = products.find((p) => p._id === productId);
      const maxQty = product?.quantity ?? 0;
      const newQty = Math.max(0, Math.min(item.quantity + delta, maxQty));
      if (newQty === 0) return prev.filter((c) => c.product._id !== productId);
      return prev.map((c) =>
        c.product._id === productId ? { ...c, quantity: newQty } : c,
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product._id !== productId));
  };

  const getAvailableQuantity = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    const inCart = cart.find((c) => c.product._id === productId);
    const used = inCart?.quantity ?? 0;
    return (product?.quantity ?? 0) - used;
  };

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.sale_price * item.quantity,
        0,
      ),
    [cart],
  );

  const rateNum = useMemo(() => parseFloat(kyatRate) || 0, [kyatRate]);
  const calculatedAmount = useMemo(
    () => (currencyType === "kyat" ? cartTotal * rateNum : cartTotal),
    [currencyType, cartTotal, rateNum],
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Add at least one product to the sale list");
      return;
    }
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!shareholderId) {
      toast.error("Please select a shareholder");
      return;
    }
    if (!paymentId) {
      toast.error("Please select a payment");
      return;
    }
    setCheckingOut(true);
    try {
      const transactionAmount =
        currencyType === "kyat" ? calculatedAmount : cartTotal;
      await saleListApi.create({
        customer_id: customerId,
        shareholder_id: shareholderId,
        payment_id: paymentId,
        currency_type: currencyType,
        transaction_amount: transactionAmount,
        ...(currencyType === "kyat" && { rate: rateNum }),
        items: cart.map((item) => ({
          product_id: item.product._id,
          quantity: item.quantity,
          original_price: item.product.sale_price,
          sale_price: item.product.sale_price,
          discount: 0,
        })),
      });
      toast.success("Sale completed");
      setCart([]);
      setCustomerId("");
      setPaymentId("");
      fetchProducts();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
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
    <div className="p-6 flex gap-6 flex-col lg:flex-row">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold mb-4">Sale</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId(null)}
          >
            All
          </Button>
          {saleCategories.map((cat) => (
            <Button
              key={cat._id}
              variant={selectedCategoryId === cat._id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(cat._id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-4xl">📦</span>
                )}
              </div>
              <CardContent className="p-3">
                <p
                  className="font-medium text-sm truncate"
                  title={product.name}
                >
                  {product.name}
                </p>
                <p className="text-primary font-semibold">
                  {product.sale_price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stock: {product.quantity}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No products available in this category.
          </p>
        )}
      </div>

      <div className="w-full lg:w-[380px] shrink-0">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Sale list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Click a product to add it to the sale list.
              </p>
            ) : (
              <>
                <ul className="space-y-3 max-h-[280px] overflow-y-auto">
                  {cart.map((item) => (
                    <li
                      key={item.product._id}
                      className="flex items-center gap-2 border-b pb-2 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.product.sale_price.toLocaleString()} ×{" "}
                          {item.quantity} ={" "}
                          {(
                            item.product.sale_price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.product._id, -1);
                          }}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            const available = getAvailableQuantity(
                              item.product._id,
                            );
                            if (available > 0)
                              updateCartQuantity(item.product._id, 1);
                            else toast.error("No more quantity available");
                          }}
                        >
                          +
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.product._id);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold pt-2">
                  Total: {cartTotal.toLocaleString()}
                  {currencyType === "kyat" && rateNum > 0 && (
                    <span className="text-muted-foreground font-normal ml-1">
                      × {rateNum} = {calculatedAmount.toLocaleString()} Kyat
                    </span>
                  )}
                </p>
                <div>
                  <Label>Customer</Label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className={cn(
                      "w-full border rounded-md px-3 py-2 mt-1 text-sm",
                      "bg-background",
                    )}
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Currency type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="currencyType"
                        value="baht"
                        checked={currencyType === "baht"}
                        onChange={() => setCurrencyType("baht")}
                        className="w-4 h-4"
                      />
                      Baht
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="currencyType"
                        value="kyat"
                        checked={currencyType === "kyat"}
                        onChange={() => setCurrencyType("kyat")}
                        className="w-4 h-4"
                      />
                      Kyat
                    </label>
                  </div>
                </div>
                {currencyType === "kyat" && (
                  <>
                    <div>
                      <Label htmlFor="kyat-rate">Rate</Label>
                      <Input
                        id="kyat-rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={kyatRate}
                        onChange={(e) => setKyatRate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Amount (Total × Rate)</Label>
                      <Input
                        readOnly
                        value={calculatedAmount.toLocaleString()}
                        className="mt-1 bg-muted"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label>Shareholder</Label>
                  <select
                    value={shareholderId}
                    onChange={(e) => setShareholderId(e.target.value)}
                    className={cn(
                      "w-full border rounded-md px-3 py-2 mt-1 text-sm",
                      "bg-background",
                    )}
                  >
                    <option value="">Select shareholder</option>
                    {shareholders.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Payment</Label>
                  <select
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className={cn(
                      "w-full border rounded-md px-3 py-2 mt-1 text-sm",
                      "bg-background",
                    )}
                  >
                    <option value="">Select payment</option>
                    {paymentsByCurrency.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.currency_type})
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={
                    checkingOut ||
                    cart.length === 0 ||
                    !customerId ||
                    !shareholderId ||
                    !paymentId
                  }
                >
                  {checkingOut ? "Processing..." : "Checkout"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sale;
