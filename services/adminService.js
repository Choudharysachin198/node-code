const adminDB = require('../models/Admin.model');

const adminService = {
    FindAll: (req) => {
        return adminDB.find();
    },
    Create: (req) => {
        var admin = new adminDB({
            admin_email: req.body.admin_email,
            admin_password: req.body.admin_password,
            status: 1
        });
        admin.save();
        return res.status(200).json(admin);
    }
}

module.exports = adminService;