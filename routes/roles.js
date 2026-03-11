var express = require('express');
var router = express.Router();

const Role = require('../schemas/roles');
const User = require('../schemas/users');


// CREATE ROLE
router.post('/', async (req, res) => {
    try {

        const body = req.body;

        if (!body.name) {
            return res.status(400).json({
                message: "Role name is required"
            });
        }

        const exist = await Role.findOne({
            name: body.name
        });

        if (exist) {
            return res.status(400).json({
                message: "Role already exists"
            });
        }

        const newRole = await Role.create({
            name: body.name,
            description: body.description || ""
        });

        return res.status(201).json({
            message: "Create role success",
            data: newRole
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// GET ALL ROLES
router.get('/', async (req, res) => {
    try {

        const roles = await Role.find({
            isDeleted: false
        });

        return res.json({
            message: "Role list",
            data: roles
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// GET ROLE BY ID
router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const role = await Role.findById(id);

        if (!role || role.isDeleted) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        return res.json({
            message: "Role detail",
            data: role
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// UPDATE ROLE
router.put('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const body = req.body;

        const role = await Role.findById(id);

        if (!role || role.isDeleted) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        const updateData = {
            name: body.name ?? role.name,
            description: body.description ?? role.description
        };

        const updated = await Role.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.json({
            message: "Update role success",
            data: updated
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// SOFT DELETE ROLE
router.delete('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const role = await Role.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        return res.json({
            message: "Role soft deleted",
            data: role
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


// GET USERS BY ROLE
router.get('/:id/users', async (req, res) => {
    try {

        const roleId = req.params.id;

        const role = await Role.findById(roleId);

        if (!role || role.isDeleted) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        const users = await User.find({
            role: roleId,
            isDeleted: false
        });

        return res.json({
            message: "Users by role",
            role: role.name,
            total: users.length,
            data: users
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


module.exports = router;