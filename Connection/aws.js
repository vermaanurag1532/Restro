// config.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  s3: {
    bucketName: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};
