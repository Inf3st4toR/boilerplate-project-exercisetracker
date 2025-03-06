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
    .then((savedUser) => {
      res.json({ username: savedUser.username, _id: savedUser._id });
    })
    .catch(console.log(err));
});

// END
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
