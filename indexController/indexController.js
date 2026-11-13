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
                console.log("invalid file type")
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
    const loneFiles = await prisma.file.findMany({
        where: {
            user_id: req.user.id,
            folder_id: null
        }
    })
    res.render("home", {user: req.user, loneFiles});
};

const getFolderController = (req, res) => {
    res.render("folder");
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
                // turn Multer error into errors array
                return res.render("home", {
                    errors: [{ msg: err.message}]
                });
            }

            next();
        });
    },
    fileValidation,
    async (req, res, next) => {
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

        const folderId = req.body?.folder_id ?  Number(req.body.folder_id) : null;
        const file = req.file;

        if (folderId) {
            const folder = await prisma.folder.findFirst({
                where: {
                    user_id: req.user.id,
                    id: folderId
                }
            });
            if (!folder) {next(new Error("You don't own this"))}
        }
        try {
            const uploadedFile = await prisma.file.create({
                data: {
                    user_id: req.user.id,
                    name: file.filename,
                    sizeByte: file.size,
                    folder_id: folderId,
                    file_path: file.path,
                    original_name: file.originalname
                }
            })
            console.log(uploadedFile)
        }catch(err) {
            console.error(err);
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

const postEditFolderController = [
    folderValidation,

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("home", {
                errors: errors.array()
            });
        }

        try {
            const newName = req.body.folder_name;
            const id = Number(req.params.id);
            await prisma.folder.update({
                where: { id, user_id: req.user.id },
                data: {name: newName}
            })
        }catch(err) {
            console.error(err);
        }
        res.redirect("/home");
    }
];

const deleteFolderController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await prisma.folder.delete({
            where: {
                id,
                user_id: req.user.id
            }
        })
        res.sendStatus(204);
    }catch(err) {
        console.error(err);
        next(err);
    }
}

const deleteFileController = async (req, res, next) => {
    try {
        const id = Number(req.params.id) ? Number(req.params.id) : null;
        await prisma.file.delete({
            where: {
                id: id,
                user_id: req.user.id
            }
        })
        res.sendStatus(204);
    }catch(err) {
        console.error(err);
        next(err);
    }
}

const getFileDetailsController = async (req, res, next) => {
    const id = Number(req.params.id) ? Number(req.params.id) : null;
    
    try {
        const file = await prisma.file.findUnique({
            where: {
                user_id: req.user.id,
                id: id
            },
            select: {
                id: true,
                created_at: true,
                sizeByte: true,
                original_name: true,
                folder_id
            }
        });
        res.render("file-page", {file})
    }catch(err) {
        next(err);
    }
}


// downloaded file doesn't show file type
const downloadFileController = async (req, res) => {
    const id = Number(req.params.id)
    const file = await prisma.file.findUnique({
        where: {
            user_id: req.user.id,
            id: id
        },
        select: {
            file_path: true,
            original_name: true
        }
    });

    if (file) {
        const absolutePath = path.resolve(file.file_path);
        return res.download(absolutePath, file.original_name);
    };
    res.sendStatus(204);
}

const getFileController = async (req, res, next) => {
    const id = Number(req.params.id)
    console.log(id)
    const file = await prisma.file.findUnique({
        where: {
            user_id: req.user.id,
            id: id
        },
        select: {
            id: true,
            created_at: true,
            sizeByte: true,
            original_name: true
        }
    });

    res.json(file);
}


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
    postAddFolderController,
    postEditFolderController,
    deleteFolderController,
    deleteFileController,
    downloadFileController,
    getFileDetailsController
}