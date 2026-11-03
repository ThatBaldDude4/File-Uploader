import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: {username: username}})

            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }
            
            const match = await bcrypt.compare(password, user.hash);
            if (!match) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch(err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        done(null, user);
    } catch (err) {
        done(err);
    }3
});

export {
    passport
}