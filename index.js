const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//Middleware for POST
app.use(express.urlencoded({ extended: true }));

//Connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"));

// Schema & Model create
const userSchema = new mongoose.Schema({ username: String });
const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

//Create a username
app.post("/api/users", (req, res) => {
  const newUser = new User({ username: req.body.username });
  newUser
    .save()
    .then((savedUser) => res.json(savedUser))
    .catch(console.error);
});

//Create an exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  User.findOne({ _id: req.params._id })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newExo = new Exercise({
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date || new Date().toDateString(),
      });

      return newExo.save();
    })
    .then((savedExo) => res.json(savedExo))
    .catch(console.error);
});

//List users
app.get("/api/users", (req, res) => {
  User.find({})
    .then((users) => res.json(users))
    .catch(console.error);
});

//Extract logs
app.get("/api/users/:_id/logs", (req, res) => {
  let count;
});

//Clean DB
app.get("/api/clean", (req, res) => {
  User.deleteMany({})
    .then(() => console.log("All items deleted"))
    .catch((err) => console.error(err));
  Exercise.deleteMany({})
    .then(() => console.log("All items deleted"))
    .catch((err) => console.error(err));
});

// END
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
