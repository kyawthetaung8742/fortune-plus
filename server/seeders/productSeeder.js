import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

dotenv.config();

const LOTTERY_CATEGORY_NAME = "Lottery";

const productNames = [
  "002678", "037608", "052464", "055461", "057509",
  "079133", "083599", "086847", "093779", "097902",
  "105381", "109822", "110817", "117821", "118682",
  "129271", "131051", "141558", "152305", "211025",
  "261338", "261890", "286934", "293786", "317777",
  "351310", "357412", "365723", "376692", "380036",
  "394349", "405366", "408662", "419653", "423075",
  "433940", "437388", "448327", "462614", "476901",
  "481994", "510568", "513860", "524855", "528273",
  "539242", "553529", "561806", "567816", "576119",
  "582103", "587196", "590432", "601483", "604745",
  "615770", "630057", "644444", "647784", "658731",
  "662097", "667004", "673018", "692398", "695630",
  "706685", "709943", "720972", "724356", "735359",
  "738669", "749646", "767295", "778220", "786515",
  "792607", "800828", "811887", "815141", "826174",
  "829554", "843867", "854848", "858180", "869135",
  "872493", "877400", "891713", "906026", "917089",
  "920439", "931476", "934752", "945763", "949065",
  "960050", "974337", "977791", "988724", "996911",
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const category = await Category.findOneAndUpdate(
      { name: LOTTERY_CATEGORY_NAME },
      { $setOnInsert: { name: LOTTERY_CATEGORY_NAME, is_sale: true } },
      { upsert: true, new: true },
    );

    await Product.deleteMany({ category_id: category._id });

    const products = productNames.map((name) => ({
      category_id: category._id,
      name,
      quantity: 1,
      purchase_price: 0,
      sale_price: 100,
    }));

    await Product.insertMany(products);

    console.log(`Seeded ${products.length} lottery products successfully`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedProducts();
