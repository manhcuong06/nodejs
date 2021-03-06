var express = require('express');
var bcrypt = require('../libraries/bcrypt_module');
var socketio_module = require('../libraries/socketio_module');
var router = express.Router();

// Models
var Bill = require('../models/bill');
var Conversation = require('../models/conversation');
var Gallery = require('../models/gallery');
var Message = require('../models/message');
var Product = require('../models/product');
var User = require('../models/user');

router.use((req, res, next) => {
    if (req.session.current_user && req.session.current_user.level > 3) {
        var condition = {
            user_id: Conversation.getObjectId(req.session.current_user._id),
        };
        Conversation.findOne(condition).then(con => {
            if (con) {
                Message.find({conversation_id: Message.getObjectId(con._id)}).then(messages => {
                    res.locals.messages = messages;
                    next();
                });
            } else {
                next();
            }
        });
    } else {
        next();
    }
});

router.get('/', (req, res) => {
    Product.find({}, { _id: -1 }, 0, 6).then(top_games => {
        res.render('site/', {
            top_games: top_games,
        });
    });
});

router.get('/about', (req, res) => {
    res.render('site/about');
});

router.get('/contact', (req, res) => {
    res.render('site/contact');
});

router.get('/detail/:id', (req, res, next) => {
    var condition = { _id: Product.getObjectId(req.params.id) };
    Product.findOne(condition).then(product => {
        if (!product) {
            next(); // 404 Page Not Found
        } else {
            res.render('site/detail', {
                product: product,
            });
        }
    });
});

router.get('/gallery', (req, res) => {
    Gallery.find().then(gallery => {
        res.render('site/gallery', {
            gallery: gallery,
        });
    });
});

router.get('/news', (req, res) => {
    res.render('site/news');
});

router.get('/reviews', (req, res) => {
    res.render('site/reviews');
});

router.all('/cart-checkout', (req, res) => {
    if (!req.session.cart) {
        res.redirect('/site');
    } else if (req.method == 'GET') {
        res.render('site/cart-checkout', {
            cart_disabled: true,
        });
    } else {
        var bill = req.body;
        bill.quantity = res.locals.cart_quantity;
        bill.price = res.locals.cart_price;
        bill.created_at = new Date().getTime();
        bill.details = [];
        req.session.cart.forEach(product => {
            var detail = product;
            detail._id = Bill.getObjectId(detail._id);
            detail.unit_price = detail.price / detail.quantity;

            bill.details.push(detail);
        });
        Bill.insert(bill).then(result => {
            socketio_module.broadcastEmit('update_bill', result.ops[0]);
            req.session.cart = null;
            res.redirect('/site');
        });
    }
});

router.post('/login', (req, res) => {
    User.findOne(req.body).then(user => {
        if (user) {
            User.update(user, { last_login: new Date().getTime() }).then(result => {
                req.session.current_user = {
                    _id: user._id,
                    name: user.name,
                    level: user.level,
                };
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    });
});

router.post('/signup', (req, res) => {
    var data_post = req.body;
    data_post.level = 4;
    data_post.created_at = new Date().getTime();
    User.insert(data_post).then(result => {
        req.session.current_user = result.ops[0];
        res.redirect('/');
    });
});

router.get('/logout', (req, res) => {
    req.session.current_user = null;
    res.redirect('/site');
});

router.get('/callback', (req, res) => {
    var token = req.query.access_token;
    if (token) {
        req.session.current_user = {
            username: 'Guest'
        }
    }
    res.redirect('/site');
});


// Ajax routes
// Add and update product in cart
router.post('/update-cart', (req, res) => {
    var cart = req.session.cart;
    var id = req.body.id;
    var condition = { _id: Product.getObjectId(id) };

    Product.findOne(condition).then(model => {
        if (!cart || cart.length == 0) {
            cart = [model];
        } else {
            var is_found = false;
            var quantity = Number(req.body.quantity);
            cart.forEach((product, i) => {
                if (product._id == id) {
                    product.quantity += quantity;
                    product.price += model.price * quantity;
                    is_found = true;
                    if (product.quantity <= 0) {
                        cart.splice(i, 1);
                    }
                }
            });
            if (!is_found) {
                cart.push(model);
            }
        }
        req.session.cart = cart;
        res.send(cart);
    });
});

// Login validation - Check email and password
router.post('/login-validate', (req, res) => {
    User.findOne(req.body).then(user => {
        if (user) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});

// Signup validation - Check email existed
router.post('/signup-validate', (req, res) => {
    User.findOne(req.body).then(user => {
        if (!user) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});
// END Ajax routes

module.exports = router;
