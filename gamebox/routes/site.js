var express = require('express');
var router = express.Router();
var google_module = require('../libraries/google-module');

const games = [
    {
        id: 1,
        name: 'Action game',
        description: 'This is action game',
        image: 't1.jpg',
        price: 200,
        quantity: 1,
    },
    {
        id: 2,
        name: '3D game',
        description: 'This is 3D game',
        image: 't2.jpg',
        price: 400,
        quantity: 1,
    },
    {
        id: 3,
        name: 'Arcade game',
        description: 'This is arcade game',
        image: 't3.jpg',
        price: 300,
        quantity: 1,
    },
    {
        id: 4,
        name: 'Flash game',
        description: 'This is flash game',
        image: 't4.jpg',
        price: 100,
        quantity: 1,
    },
];

router.get('/', (req, res) => {
    req.data.games = games;
    renderHTML(req, res);
});

router.get('/about', (req, res) => {
    renderHTML(req, res);
});

router.get('/contact', (req, res) => {
    renderHTML(req, res);
});

router.get('/detail', (req, res) => {
    renderHTML(req, res);
});

router.get('/gallery', (req, res) => {
    renderHTML(req, res);
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

    if (!cart || cart.length == 0) {
        cart = [model];
    } else {
        var is_found = false;
        var quantity = Number(req.body.quantity);
        cart.forEach((game, i) => {
            if (game.id == id) {
                game.quantity += quantity;
                game.price += model.price * quantity;
                is_found = true;
                if (game.quantity <= 0) {
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