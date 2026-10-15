const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const app = express();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Import the Fruit model
const Fruit = require("./models/fruit.js");

// Middleware: mora biti IZNAD svih ruta
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// GET /
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// GET /fruits
app.get("/fruits", async (req, res) => {
  const allFruits = await Fruit.find();
  res.render("fruits/index.ejs", { fruits: allFruits });
});

// GET /fruits/new
app.get("/fruits/new", (req, res) => {
  res.render("fruits/new.ejs");
});

// GET /fruits/:fruitId
app.get("/fruits/:fruitId", async (req, res) => {
  const foundFruit = await Fruit.findById(req.params.fruitId);
  res.render("fruits/show.ejs", { fruit: foundFruit });
});

// POST /fruits
app.post("/fruits", async (req, res) => {
  try {
    req.body.isReadyToEat = req.body.isReadyToEat === "on";
    const fruit = await Fruit.create(req.body);
    console.log("Sačuvano:", fruit);
    res.redirect("/fruits");
  } catch (err) {
    console.error("GREŠKA:", err.message);
    res.status(500).send("Greška: " + err.message);
  }
});

// DELETE /fruits/:fruitId
app.delete("/fruits/:fruitId", async (req, res) => {
  await Fruit.findByIdAndDelete(req.params.fruitId);
  res.redirect("/fruits");
});

// GET /fruits/:fruitId/edit
app.get("/fruits/:fruitId/edit", async (req, res) => {
  const foundFruit = await Fruit.findById(req.params.fruitId);
  res.render("fruits/edit.ejs", {
    fruit: foundFruit,
  });
});


// PUT /fruits/:fruitId
app.put("/fruits/:fruitId", async (req, res) => {
  
  req.body.isReadyToEat = req.body.isReadyToEat === "on";

  
  await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);

  
  res.redirect(`/fruits/${req.params.fruitId}`);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});