const router = require('express').Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');


//REGISTER
router.post("/register", async (req, res) => {
    try {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash
        });

        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
})

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        !user && res.status(400).json("Wrong credentials!");

        if (user) {
            const validate = await bcrypt.compare(req.body.password, user.password);
            !validate && res.status(400).json("Wrong credentials!");

            if (validate) {
                const { password, ...others } = user._doc;
                res.status(200).json(others);
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router