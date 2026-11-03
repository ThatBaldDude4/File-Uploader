import express from "express";
import path from "node:path";
import { indexRouter } from "./indexRouter/indexRouter.js";
import { passport } from "./config/passport.js";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./lib/prisma.js";


const app = express();
const PORT = process.env.PORT || 8000;

// connect ejs
app.set("views", path.join(import.meta.dirname, "client/views"));
app.set("view engine", "ejs");

// setup decoding
app.use(express.urlencoded({ extended: true }));

// setup session
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true
        })
    })
);

// init passport into app
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter)

// final route catch
app.use("*splat", (req, res) => {
    res.status(404).render("404");
});

// error route
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error");
})

app.listen(PORT, "0.0.0.0", (error) => {
    if (error) {
        throw error;
    }
    console.log("server listening on port ", PORT);
});