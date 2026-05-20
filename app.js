const express = require("express");
const app = express();

// allows css/js/images
app.use(express.static(__dirname));

// home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// starts server
app.listen(3000, () => {
    console.log("Server running");
});