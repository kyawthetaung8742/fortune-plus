import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuid } from "uuid";
import { s3 } from "../config/s3.js";

const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
if (!bucket) {
  throw new Error(
    "AWS_S3_BUCKET or S3_BUCKET is required in .env for product image upload"
  );
}

const uploadProductImage = multer({
  storage: multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      cb(null, `products/${uuid()}.${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default uploadProductImage;
