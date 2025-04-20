import S3ImageRepository from '../Repository/images.repository.js';

const S3ImageService = {
    uploadImage: async (fileBuffer, fileName, fileType) => {
        try {
            const result = await S3ImageRepository.uploadImage(fileBuffer, fileName, fileType);
            return result;  // This will include the signed URL
        } catch (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    },

    getImageUrl: async (fileName) => {
        try {
            const url = await S3ImageRepository.getImageUrl(fileName);
            return url;
        } catch (error) {
            throw new Error(`Failed to retrieve image URL: ${error.message}`);
        }
    },

    getAllImages: async () => { // New method to get all images
        try {
            const imageUrls = await S3ImageRepository.getAllImages();
            return imageUrls;
        } catch (error) {
            throw new Error(`Failed to retrieve all image URLs: ${error.message}`);
        }
    }
};

export default S3ImageService;
