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
  userId: String,
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
        userId: user._id,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date || new Date().toDateString(),
      });

      return newExo.save().then((savedExo) => {
        res.json({
          username: savedExo.username,
          description: savedExo.description,
          duration: savedExo.duration,
          date: savedExo.date,
          _id: user._id,
        });
      });
    })
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
  //define from & to
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;

  //Start DB search
  Exercise.find({ userId: req.params._id })
    .limit(parseInt(req.query.limit))
    .then((logs) => {
      if (from) {
        logs = logs.filter((log) => new Date(log.date) >= from);
      }
      if (to) {
        logs = logs.filter((log) => new Date(log.date) <= to);
      }
      if (logs.length === 0) {
        return res.json({ error: "No logs" });
      }
      res.json({
        username: logs[0].username,
        count: logs.length,
        _id: logs[0].userId,
        log: logs.map((i) => ({
          description: i.description,
          duration: i.duration,
          date: i.date,
        })),
      });
    })
    .catch(console.error);
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
