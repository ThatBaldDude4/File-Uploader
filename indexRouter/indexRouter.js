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
    postUploadFileController,
    postAddFolderController,
    postEditFolderController,
    deleteFolderController,
    deleteFileController
} from "../indexController/indexController.js";
import isAuthenticated from "../utils/middlewear/isAuthenticated.js";
import loadFolders from "../utils/middlewear/loadFolders.js";
import loadFiles from "../utils/middlewear/loadFiles.js";

const indexRouter = Router();

indexRouter.get("/", (req, res) => {res.redirect("/home")});

// need to wire /sign-up
indexRouter.get("/sign-up", getSignupController)

indexRouter.post("/sign-up", postSignupController)

indexRouter.get("/login", getLoginController)

indexRouter.post("/login", postLoginController)

indexRouter.get("/home", isAuthenticated, loadFolders, loadFiles, getHomeController)

indexRouter.get("/folder/:folderId", isAuthenticated, getFolderController)

indexRouter.get("/home/file/:fileId", isAuthenticated, getFileController)

indexRouter.get("/logout", getLogoutController)

indexRouter.post("/uploadFile", isAuthenticated, loadFolders, postUploadFileController);

indexRouter.post("/addFolder", isAuthenticated, loadFolders, postAddFolderController);

indexRouter.post("/editFolder/:id", isAuthenticated, loadFolders, postEditFolderController);

indexRouter.delete("/deleteFolder/:id", isAuthenticated, deleteFolderController)

indexRouter.delete("/deleteFile/:id", isAuthenticated, deleteFileController)

export  {
    indexRouter
}