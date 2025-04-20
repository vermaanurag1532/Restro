import S3ImageService from '../Service/Images.service.js';

const S3ImageController = {
    uploadImage: async (req, res) => {
        const { originalname, mimetype, buffer } = req.file;
        try {
            const result = await S3ImageService.uploadImage(buffer, originalname, mimetype);
            res.status(201).json({ message: 'Image uploaded successfully', url: result.url });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    

    getImageUrl: async (req, res) => {
        const { fileName } = req.params;
        try {
            const url = await S3ImageService.getImageUrl(fileName);
            res.status(200).json({ url });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllImages: async (req, res) => { // New method to get all images
        try {
            const imageUrls = await S3ImageService.getAllImages();
            res.status(200).json({ images: imageUrls });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default S3ImageController;
