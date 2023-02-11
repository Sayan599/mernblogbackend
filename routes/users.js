const router = require('express').Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Post = require('../models/Post');


//UPDATE
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);
        }
        try {
            const oldUser = await User.findById(req.params.id)
            const updatedUser = await User.findByIdAndUpdate(req.params.id,
                { $set: req.body }, { new: true });
            const get = await Post.updateMany({ username: oldUser.username }, { $set: { username: req.body.username } })
            console.log(get);
            res.status(200).json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(401).json("You can update only your account");
    }
})

//DELETE
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                try {
                    await Post.deleteMany({ username: user.username });
                    await User.findByIdAndDelete(req.params.id);
                    res.status(200).json("User has been deleted...");
                } catch (err) {
                    res.status(500).json(err);
                }
            }
        } catch (err) {
            res.status(404).json("User not found");
        }
    }
    else {
        res.status(401).json("You can delete only your account!");
    }
})

//GET USER
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
})

//FORGET PASSWORD
router.post("/pass", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = bcrypt.hashSync(req.body.password, salt);
        const user = await User.findOneAndUpdate({ email: req.body.email }, { $set: { password: hashPassword } });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router