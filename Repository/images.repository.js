import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../Connection/aws.js';

const s3Client = new S3Client({
    region: config.s3.region,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey
    }
});

const S3ImageRepository = {
    // Upload Image to S3 and return its URL
    uploadImage: async (fileBuffer, fileName, fileType) => {
        const params = {
            Bucket: config.s3.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: fileType
        };
    
        try {
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
    
            const getUrlCommand = new GetObjectCommand({ Bucket: config.s3.bucketName, Key: fileName });
            const url = await getSignedUrl(s3Client, getUrlCommand, { expiresIn: 3600 });
            return { url };
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    },  

    // Get Signed URL for Image
    getImageUrl: async (fileName) => {
        const params = {
            Bucket: config.s3.bucketName,
            Key: fileName
        };

        try {
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return url;
        } catch (error) {
            console.error("Error getting image URL:", error);
            throw error;
        }
    },

    // Get URLs for All Images
    getAllImages: async () => {
        const params = {
            Bucket: config.s3.bucketName
        };

        try {
            const command = new ListObjectsV2Command(params);
            const data = await s3Client.send(command);
            const urls = await Promise.all(data.Contents.map(async (item) => {
                const command = new GetObjectCommand({ Bucket: config.s3.bucketName, Key: item.Key });
                return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            }));
            return urls;
        } catch (error) {
            console.error("Error getting all image URLs:", error);
            throw error;
        }
    }
};

export default S3ImageRepository;
