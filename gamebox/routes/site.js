var express = require('express');
var router = express.Router();

// Google Authenticator
var google_module = require('../libraries/google_module');

// Models
var Gallery = require('../models/gallery');
var Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.getArrayData('product', {}, top_games => {
        res.render('site/', {
            data: req.data,
            top_games: top_games,
        });
    });
});

router.get('/about', (req, res) => {
    renderHTML(req, res);
});

router.get('/contact', (req, res) => {
    renderHTML(req, res);
});

router.get('/detail/:id', (req, res, next) => {
    Product.getDataById('product', req.params.id, (err, product) => {
        if (err) {
            next(); // 404 Page Not Found
        } else {
            res.render('site/detail', {
                data: req.data,
                product: product,
            });
        }
    });
});

router.get('/gallery', (req, res) => {
    Product.getArrayData('gallery', {}, gallery => {
        res.render('site/gallery', {
            data: req.data,
            gallery: gallery,
        });
    });
});

router.get('/news', (req, res) => {
    renderHTML(req, res);
});

router.get('/reviews', (req, res) => {
    renderHTML(req, res);
});

router.all('/cart-checkout', (req, res) => {
    if (req.method == 'GET') {
        renderHTML(req, res);
    } else {
        req.session.cart = null;
        res.redirect('/site');
    }
});

router.post('/update-cart', (req, res) => {
    var cart = req.session.cart;
    var id = req.body.id;
    var model = games.find(item => item.id == id);

    // if (!cart || cart.length == 0) {
    //     cart = [model];
    // } else {
    //     var is_found = false;
    //     var quantity = Number(req.body.quantity);
    //     cart.forEach((game, i) => {
    //         if (game.id == id) {
    //             game.quantity += quantity;
    //             game.price += model.price * quantity;
    //             is_found = true;
    //             if (game.quantity <= 0) {
    //                 cart.splice(i, 1);
    //             }
    //         }
    //     });
    //     if (!is_found) {
    //         cart.push(model);
    //     }
    // }
    // req.session.cart = cart;
    // res.send(cart);
    res.send(true);
});

router.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
        req.session.current_user = req.body;
        res.redirect('/site');
    } else {
        res.send('Wrong username or password');
    }
});

router.get('/logout', (req, res) => {
    req.session.current_user = null;
    res.redirect('/site');
});

router.get('/google-authentication', (req, res) => {
    res.redirect(google_module.getAccessUrl());
});

router.get('/set-access-token', (req, res) => {
    google_module.setAccessToken(req, res);
});

module.exports = router;

function renderHTML(req, res) {
    var view = req.path.replace('/', 'site/');
    res.render(view, { data: req.data });
}