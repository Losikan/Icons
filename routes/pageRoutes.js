"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const skins_json_1 = __importDefault(require("../public/skins.json"));
const router = (0, express_1.Router)();
// ---------------------------
// Dynamische Pagina Routes
// ---------------------------
const pages = [
    'friendslist',
    'homePage',
    'inventaris',
    'landingspage',
    'login',
    'profiel',
    'registreren',
    'resetpassword',
    'settings'
];
pages.forEach(page => {
    const routePath = `/${page.replace('Page', '').toLowerCase()}`;
    router.get(routePath, async (req, res) => {
        try {
            // Authenticatie check voor beveiligde pagina's
            if (['profiel', 'settings'].includes(page) && !req.session.userId) {
                return res.redirect("/login");
            }
            res.render(page);
        }
        catch (error) {
            console.error(`${page} Route Error:`, error);
            res.status(500).render("error", { message: "Laadfout" });
        }
    });
});
// ---------------------------
// Shop Route (gecorrigeerde versie)
// ---------------------------
router.get('/shop', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect("/login");
        }
        const user = await User_1.default.findById(req.session.userId);
        const items = skins_json_1.default.data.items.br;
        if (!user) {
            req.session.destroy(() => { });
            return res.redirect("/login");
        }
        res.render("shop", {
            user: user.toObject(),
            items: items
        });
    }
    catch (error) {
        console.error("Shop Route Error:", error);
        res.status(500).render("error", { message: "Serverfout" });
    }
});
// ---------------------------
// Overige Routes
// ---------------------------
router.get('/', (req, res) => {
    res.render('landingspage');
});
router.post('/resetpassword', (req, res) => {
    try {
        const items = skins_json_1.default.data.items.br;
        res.render('resetpassword', { items });
    }
    catch (error) {
        console.error("Reset Password Route Error:", error);
        res.status(500).render("error", { message: "Formulierfout" });
    }
});
exports.default = router;
