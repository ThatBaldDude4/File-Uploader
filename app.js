import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 8000;

// connect ejs
app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

// final route catch
app.use("*splat", (req, res) => {
    res.status(404).render("404");
})

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