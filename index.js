// Modules
const express = require("express");
const path = require("path");

// Customs
const router = require("./API_Router");

// Init constants
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json({ extended: true }));
app.use("/api", router);

/*
 * [START APP ON THE SERVER]
 */

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.use("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

/*
 * This self-exploding function
 * to use async/await construct.
 */

(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server has been started on (Port: ${PORT}) ...`);
    });
  } catch (error) {
    console.error(`Server Error: ${error}`);
    process.exit(1);
  }
})();
