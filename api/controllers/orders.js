const mongoose = require('mongoose');
const Order = require('../models/orders');
const Product = require('../models/products');

exports.orders_get_all = (req, res, next) => {
    Order.find()
    .select("quantity product _id")
    .populate('product', 'price name productImage') 
    .sort({$natural: -1}) 
    // To add product information into the list of orders, we can use the populate method. Here we have to
    // add the name of the property (product, name) that we want to populate.
    .exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                // let totalPrice = doc.product.price * doc.quantity;
                if(doc.product == null) {
                    totalPrice = 0
                } else {
                    totalPrice = doc.product.price * doc.quantity;
                }
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    total: totalPrice,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/orders/${doc._id}`
                    }
                }
            })
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            errot: err
        });
    });
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if(!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order Stored',
                createOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            console.log("Ravindra Patil");
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
        
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_delete_order = (req, res, next) => {
    Order.remove({_id: req.params.orderId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
    
}