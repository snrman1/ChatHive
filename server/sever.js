const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const Room = require("../room");

const app = express();
const Server= http.createServer(app);
let io = socketIO(Server)

// Connecting to MongoDB
mongoose.connect('mongodb+srv://snrman:Seniorman22@cluster0.s4ree6b.mongodb.net/usersDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database'))
  .catch(error => console.error('Error connecting to database:', error));

app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Creating schema
const userSchema = new mongoose.Schema({
  username: { type: 'string', unique: true, required: true },
  password: { type: 'string', required: true },
  email: { type: 'string', required: true }
});

const User = mongoose.model('User', userSchema);

// Route home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Route for sign Up
app.get("/signUp", (req, res) => {
  res.sendFile(path.join(__dirname, "public/signUp.html"));
});

// Route for login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Route for chatpage
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
  });


// Getting data from users in the sign-up page and saving to MongoDB
app.post("/signUp", async (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  let name = req.body.username;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username: name }, { email: email }] });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    // Create a new user
    const newUser = new User({
      username: name,
      password: pass,
      email: email
    });

    // Save the new user to the database
    await newUser.save();
    console.log("User created:", newUser);

    res.redirect('/login.html');
  } catch (error) {
    console.error("Error while creating user:", error);
    res.status(500).send("Error while creating user");
  }
});

// Handling user login with username and password
app.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
  
    try {
      // Checks  if the user exists in the database
      const user = await User.findOne({ username: username });
      if (!user) {
        console.log("User not found with username:", username);
        return res.status(404).send("User not found");
      }
  
      // Checks if the provided password matches the stored password
      if (user.password !== password) {
        console.log("Incorrect password for user:", username);
        return res.status(401).send("Incorrect password");
      }
  
      // Here, you can consider the user as successfully logged in.
     // console.log("User logged in:", user);
  
      // Redirect the user to the home page after successful login
      res.redirect("/home.html");
    } catch (error) {
      console.error("Error while logging in:", error);
      res.status(500).send("Error while logging in");
    }
  });


  const room = new Room();



io.on("connection", async (socket) => {
  const roomID = await room.joinRoom();
  // join room
  socket.join(roomID);

  socket.on("send-message", (message) => {
    socket.to(roomID).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    // leave room
    room.leaveRoom();
  });
});

io.on("error", (err) => {
  console.log("Error opening server");
});
  /*io.on("error", (err) => {
    console.log("Error opening server");
  });

*/
Server.listen(3000, function () {
  console.log('Server is running on port 3000');
});
