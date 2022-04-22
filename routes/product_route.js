/* Requirements */
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
/* 3/30 - added isLoggedIn middleware */
const { isLoggedIn, isAuthor, validateProduct } = require('../middleware');
const Product = require('../models/product_model');

console.log("inside product route")

//products page route: will display all products
router.get(
	'/',
	catchAsync(async (req, res) => {
		let searchText = {};
		// get search text from Query param and generate mongo query
		if(req.query.searchText != null || req.query.searchText != undefined) {
			searchText = {"title": { $regex: new RegExp(req.query.searchText.toLowerCase(), "i") }};
		}
		console.log("searchText", searchText);
		const products = await Product.find(searchText);
		res.render('products/index', { products });
	})
);


//products page route: will display all products
// router.get(
// 	'/',
// 	catchAsync(async (req, res) => {
// 		var sort = req.query.sort;
// 		var sortOrder = 
// 			sort === "1" ? {price: -1}
// 			: sort === "2" ? {price: 1}
// 			: sort === "3" ? {quantity: -1}
// 			: sort === "4" ? {quantity: 1}
// 			: {};
// 		const products = await Product.find({}).sort(sortOrder);
// 		res.render('products/index', { products });
// 	})
// );

//search products route: will display the product as customer types in 



//new product route: page to create a new product
/* 3/30 - added isLoggedIn middleware to protect creating a new product*/
router.get('/new', isLoggedIn, (req, res) => {
	res.render('products/new');
});

//post route for new product: adds the new product to the database
//and will redirect the user to the newly created product
/* 3/30 - added isLoggedIn middleware to protect creating a new product*/
router.post(
	'/',
	isLoggedIn,
	validateProduct, //Call to validate the new data
	catchAsync(async (req, res) => {
		const product = new Product(req.body.product);
		/* 3/30 - associate the new product with the user who created it */
		product.author = req.user._id;
		await product.save();
		req.flash('success', 'Successfully made a new product!');
		res.redirect(`/products/${product._id}`);
	})
);

//product details route: will display a product's details
router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const product = await Product.findById(req.params.id).populate('author');
		if (!product) {
			req.flash('error', 'Cannot find that product');
			return res.redirect('/products');
		}
		res.render('products/show', { product });
	})
);

/* 4/3 - shopping cart route */

//edit product route: page to edit a product
/* 3/30 - added isLoggedIn and isAuthor middleware to protect editing a product */
router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const product = await Product.findById(id);
		if (!product) {
			req.flash('error', 'Cannot find that product');
			return res.redirect('/products');
		}
		res.render('products/edit', { product });
	})
);

//put route for editing product: updates the product in the database
//and will redirect the user to the updated product
/* 3/30 - added isLoggedIn and isAuthor middleware to protect editing a product */
router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateProduct, //Call to validate updated data
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
		req.flash('success', 'Successfully updated product!');
		res.redirect(`/products/${product._id}`);
	})
);

//delete route: deletes the product
/* 3/30 - added isLoggedIn and isAuthor middleware to protect deleting a product */
router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Product.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted product');
		res.redirect('/products');
	})
);

module.exports = router;
