const path = require("path");
const http = require("http");

const express = require("express");
const { Server } = require("socket.io");

// const sequelize = require("./config/db");
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

// sequelize
//   .sync()
//   .then(() => {
    server.listen(3000, (err) => {
      if (err) console.log(err);
      else console.log("server start");
    });
  // })
  // .catch((err) => {
  //   console.log(err);
  // });

let romms = []
io.on("connection", (socket) => {
  socket.on("create-room", async (roomName) => {
    // await Room.create({
    //   name: roomName,
    //   users: [socket.id],
    // });
    romms.push(
      {name: roomName, users: [socket.id]}
    )
    socket.join(roomName);
    socket.emit("created", { roomName, id: socket.id });
  });

  socket.on("request-join-game", async (roomName) => {
    const room = romms.find((room) => {
      if(room.name == roomName) {
        return room
      }
    })

    if (room) {
      romms = romms.map((room) => {
        if(room.name == roomName) {
          room.users = [...room.users, socket.id]
          return room 
        }else {
          return room
        }
      })

      io.to(roomName).emit("player-join", socket.id);
      socket.join(roomName);
      socket.emit("joied", {
        roomName: room.name,
        users: [room.users, socket.id],
      });
    }
  });

  socket.on("start-room", (roomName) => {
    romms = romms.map(room => {
      if(room.name == roomName) {
        room.status = "started"
        room.q = createQ()
        room.e = eval(room.q)
        room.result = null
        room.star = {}
        room.sended = []

        room.users.forEach(user => {
          room.star[user] = 0
        });
        return room
      }
      return room
    })

    let room = romms.find((room) => {
      if(room.name == roomName) {
        return room
      }
    })
    io.to(roomName).emit("q", room.q)

  });
  socket.on("r", ({rq, roomNameA}) => {
    let room = romms.find((room) => {
      if(room.name == roomNameA) {
        return room
      }
    })

    if(room.e == rq.r && !room.result) {
      romms = romms.map(room => {
        if(room.name == roomNameA) {
          room.result = true
          room.star[socket.id] =  room.star[socket.id] + 1
          return room
        }
        return room
      })
    }
    romms = romms.map(room => {
      if(room.name == roomNameA) {
        room.sended.push(socket.id)

        if(room.sended.length == room.users.length) {
          room.sended = []
          room.q = createQ()
          room.result = null
          room.e = eval(room.q)
          io.to(roomNameA).emit("q", room.q)
        }else {
          socket.emit("sabr")
        }

        return room
      }
      return room
    })

    room.users.forEach(item => {
      io.to(socket.id).emit("star", {
        you: room.star[socket.id],
      })
    })
    console.log(romms);
  })
});

var x = {
  name: "sss", 
  users: [],
  status: "started", // devlopment
  q: "10-2",
  e: "8",
  result: "id",
  star: {"id": "10", "id2": "3"}
}
// npm install --registry="https://mirror-npm.runflare.com" express
