var express = require('express');
var router = express.Router();
const User = require('../schemas/users');


// CREATE USER
router.post('/', async (req, res) => {
    try {
        const body = req.body;

        if (!body.username || !body.password || !body.email) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const checkUser = await User.findOne({
            $or: [
                { username: body.username },
                { email: body.email }
            ]
        });

        if (checkUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const newUser = await User.create({
            username: body.username,
            password: body.password,
            email: body.email,
            fullName: body.fullName || "",
            avatarUrl: body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
            role: body.role
        });

        return res.status(201).json({
            message: "Create user success",
            data: newUser
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});


// GET ALL USERS
router.get('/', async (req, res) => {
    try {

        const listUsers = await User.find({
            isDeleted: false
        });

        return res.json({
            message: "List users",
            data: listUsers
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// GET USER BY ID
router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const user = await User.findById(id);

        if (!user || user.isDeleted) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            message: "User detail",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// UPDATE USER
router.put('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const body = req.body;

        const user = await User.findById(id);

        if (!user || user.isDeleted) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const updateData = {
            fullName: body.fullName ?? user.fullName,
            avatarUrl: body.avatarUrl ?? user.avatarUrl,
            role: body.role ?? user.role
        };

        const updated = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.json({
            message: "Update success",
            data: updated
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// SOFT DELETE USER
router.delete('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const user = await User.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            message: "User soft deleted",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// ENABLE USER
router.post('/enable', async (req, res) => {
    try {

        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({
                message: "email and username required"
            });
        }

        const user = await User.findOneAndUpdate(
            {
                email,
                username,
                isDeleted: false
            },
            { status: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "Invalid user info"
            });
        }

        return res.json({
            message: "User enabled",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// DISABLE USER
router.post('/disable', async (req, res) => {
    try {

        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({
                message: "email and username required"
            });
        }

        const user = await User.findOneAndUpdate(
            {
                email,
                username,
                isDeleted: false
            },
            { status: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "Invalid user info"
            });
        }

        return res.json({
            message: "User disabled",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


module.exports = router;