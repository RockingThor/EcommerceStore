const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid= FILE_TYPE_MAP[file.mimetype];
        let uploadError= new Error('Invalid image type!');
        if(isValid){
            uploadError=null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid category');
    }
    const file=req.file;
    if(!file){
        return res.status(400).send('No image file present in the request');
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if (!product) {
        return res.status(500).send('The product can not be created');
    }
    res.send(product);
})

router.put(`/:id`, uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid product id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid category');
    }

    const product1= await Product.findById(req.params.id);
    if(!product1){
        return res.status(400).send('Invalid request');
    }

    const file= req.file;
    let imagePath;
    if(file){
        const fileName=file.filename;
        const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`;
        impagePath=`${basePath}${fileName}`;
    }else{
        imagePath=product1.image;
    }

    const product = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true });
    if (!product) {
        return res.status(400).send('the product was not created')
    }
    res.send(product);
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product was deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'product not found' });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);
    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        count: productCount
    });
})

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);
    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
})

router.put('/gallery-images/:id', uploadOptions.array('images',10), async (req,res)=>{
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid product id');
    }
    const files= req.files;
    let imagesPaths=[];
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    if(files){
        files.map(file=>{
            imagesPaths.push(`${basePath}${file.fileName}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new: true}
    )

    if(!product){
        return res.status(500).send('The product can not be updated!');
    }
    res.send(product);
})



module.exports = router;