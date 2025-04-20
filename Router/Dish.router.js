import express from 'express';
import multer from 'multer';
import dishController from '../Controller/Dish.controller.js';
import S3ImageController from '../Controller/images.controller.js'

const DishRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

DishRouter.post('/upload', upload.single('image'), S3ImageController.uploadImage)
DishRouter.get('/image-url/:fileName', S3ImageController.getImageUrl);
DishRouter.get('/upload', S3ImageController.getAllImages);

DishRouter.get('/', dishController.getAllDishes);
DishRouter.get('/:id', dishController.getDishById);
DishRouter.post('/', dishController.addDish);
DishRouter.put('/:id', dishController.updateDish);
DishRouter.delete('/:id', dishController.deleteDish);

export default DishRouter;