import prisma from "../../lib/prisma.js";
export default async function loadFolders(req, res, next) {
    if (req.user) {
        res.locals.folders = await prisma.folder.findMany({
        where: {
            user_id: req.user.id,
        },
        include: {
            files: true
        }
    })
    }
    next();
}