import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  const key = fileUrl.split(".amazonaws.com/")[1];
  if (!key) return;

  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  if (!bucket) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};
