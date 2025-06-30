const path = require("path");
const http = require("http");

const express = require("express");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const Room = require("./models/room");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const actions = ["-", "+", "*"];
const number = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const createQ = () => {
  return `${number[Math.floor(Math.random() * number.length)]}${
    actions[Math.floor(Math.random() * actions.length)]
  }${number[Math.floor(Math.random() * number.length)]}`;
};

// midd
app.use(express.static(path.join(__dirname, "public")));

// config view engien
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// routes
app.use("/", require("./routes/routes"));

sequelize
  .sync()
  .then(() => {
    server.listen(3000, (err) => {
      if (err) console.log(err);
      else console.log("server start");
    });
  })
  .catch((err) => {
    console.log(err);
  });

const romms = [
  
]
io.on("connection", (socket) => {
  // console.log("connected", socket.id);

  socket.on("create-room", async (roomName) => {
    await Room.create({
      name: roomName,
      users: [socket.id],
    });

    socket.join(roomName);
    socket.emit("created", { roomName, id: socket.id });
  });

  socket.on("request-join-game", async (roomName) => {
    const room = await Room.findOne({
      where: {
        name: roomName,
      },
    });

    if (room) {
      await Room.update(
        {
          users: [...JSON.parse(room.users), socket.id],
        },
        {
          where: {
            id: room.id,
          },
        }
      );

      io.to(roomName).emit("player-join", socket.id);
      socket.join(roomName);
      socket.emit("joied", {
        roomName: room.name,
        users: [...JSON.parse(room.users), socket.id],
      });
    }
  });

  socket.on("start-room", (roomName) => {});
});
// npm install --registry="https://mirror-npm.runflare.com" express
