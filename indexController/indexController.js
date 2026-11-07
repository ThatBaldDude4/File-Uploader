import { body, validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { passport } from "../config/passport.js";
import path from "node:path";
import multer from "multer";
import fs from "node:fs/promises";

const upload = multer({
    dest: "client/uploads",
    limits: { fileSize: 5 * 1024 * 1024}
})

const formValidation = [
    body("first_name")
        .isLength({min: 1, max: 255})
        .withMessage("First name must be between 1 - 255 characters"),
    body("last_name")
        .isLength({min: 1, max: 255})
        .withMessage("Last name must be between 1 - 255 characters"),
    body("username")
        .isLength({min: 1, max: 255})
        .withMessage("Username must be between 1 - 255 characters long")
        .custom(async (username) => {
            const user = await prisma.user.findUnique({
                where: {username}
            });

            if (user) {
                throw new Error("Username already in use")
            }

            return true;
        }),
    body("password")
        .isLength({min: 1, max: 255})
        .withMessage("Password must be between 1 - 255 characters"),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must enter a valid email")
        .custom(async (email) => {
            const user = await prisma.user.findUnique({
                where: {email}
            });

            if (user) {
                throw new Error("Email already in use")
            }

            return true;
        }),
    body("confirm_password")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Passwords do not match")
]

const fileValidation = [
    body("uploaded_file")
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("No file uploaded");
            }
            const allowedExtensions = ['.jpg', '.png', '.jpeg', '.webp'];
            const fileExt = path.extname(req.file.originalname).toLowerCase();
            const maxSize = 8 * 1024 * 1024;
            if (!allowedExtensions.includes(fileExt)) {
                throw new Error("Invalid file type")
            }

            if (req.file.size > maxSize) {
                throw new Error("File to large")
            }

            return true
        })
]

const folderValidation = [
    body("folder_name")
        .isLength({min: 1, max: 255})
        .withMessage("Name must be between 1 - 255 characters")
]

const getHomeController = async (req, res) => {
    const folders = await prisma.folder.findMany({
        where: {
            user_id: req.user.id
        }
    })
    res.render("home", {user: req.user, folders});
};

const getFolderController = (req, res) => {
    res.render("folder");
};

const getFileController = (req, res) => {
    res.render("filePage");
};

const getSignupController = (req, res) => {
    res.render("sign-up")
}

const postSignupController = [
    formValidation,

    async (req, res) => {
        // validate form
        const errors = validationResult(req);
        const {first_name, last_name, email, username, password} = req.body;

        if (!errors.isEmpty()) {
            return res.render("sign-up", {
                errors: errors.array(),
                form_data: {
                    first_name, last_name, email, username
                }
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    username,
                    hash: hashedPassword
                }
            });

            res.render("login-form")
        }catch(error) {
            console.error(error)
        }
    }
]

const getLoginController = (req, res) => {
    res.render("login-form")
}

const postLoginController = (req, res) => {
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/login",
        failureMessage: true,
    })(req, res);
}

const getLogoutController = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
}

// need to setup validation to confirm file type
const postUploadFileController = [
    (req, res, next) => {
        upload.single("uploaded_file")(req, res, (err) => {
            if (err) {
                // turn Multer error into your errors array
                return res.render("home", {
                    errors: [{ msg: err.message}]
                });
            }

            next();
        });
    },
    fileValidation,
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            try {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
            } catch (err) {
                console.error(err);
            }

            return res.render("home", {
                errors: errors.array()
            });
        }
        res.redirect("/home");
    }
]

const postAddFolderController = [
    folderValidation,

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("home", {
                errors: errors.array()
            });
        }

        try {
            await prisma.folder.create({
                data: {
                    name: req.body.folder_name,
                    user_id: req.user.id
                }
            })
        }catch(err) {
            console.error(err);
        }
        res.redirect("/home");
    }
]


export {
    getHomeController,
    getFileController,
    getFolderController,
    getSignupController,
    postSignupController,
    getLoginController,
    postLoginController,
    getLogoutController,
    postUploadFileController,
    postAddFolderController
}