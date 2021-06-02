const express = require("express");
const session = require("express-session");
const fileStoreFactory = require("session-file-store");
const { join } = require("path");
const { tmpdir } = require("os");
const { postMachine, getMachine } = require("./handlers");
const sessionMiddleware = session({
  store: new fileStoreFactory(session)({
    path: join(tmpdir(), "xstate-express"),
  }),
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  name: "xstate-express",
});

const app = express();
app.use(express.json());
app.use(sessionMiddleware);
app.get("/machine", getMachine);
app.post("/machine", postMachine);
const { PORT = 5000 } = process.env;
app.listen(PORT, console.log(`Server started on port: ${PORT}`));
