import { Router } from "express";
import { 
    getHomeController,
    getFileController,
    getFolderController,
    getSignupController,
    postSignupController,
    getLoginController,
    postLoginController,
    getLogoutController,
    postUploadFileController
} from "../indexController/indexController.js";
import isAuthenticated from "../utils/middlewear/isAuthenticated.js";

const indexRouter = Router();

indexRouter.get("/", (req, res) => {res.redirect("/home")});

// need to wire /sign-up
indexRouter.get("/sign-up", getSignupController)

indexRouter.post("/sign-up", postSignupController)

indexRouter.get("/login", getLoginController)

indexRouter.post("/login", postLoginController)

indexRouter.get("/home", isAuthenticated, getHomeController)

indexRouter.get("/folder/:folderId", isAuthenticated, getFolderController)

indexRouter.get("/home/file/:fileId", isAuthenticated, getFileController)

indexRouter.get("/logout", getLogoutController)

indexRouter.post("/uploadFile", isAuthenticated, postUploadFileController);

export  {
    indexRouter
}