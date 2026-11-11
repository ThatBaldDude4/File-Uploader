import prisma from "../../lib/prisma.js";
export default async function loadFiles(req, res, next) {
    if (req.user) {
        res.locals.files = await prisma.file.findMany({
        where: {
            user_id: req.user.id,
        }
    })
    }
    next();
}