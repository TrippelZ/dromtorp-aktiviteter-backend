const Config = require("./config.json");

const DBControl  = require("./database/database.js");
const APIHandler = require("./api_handler/api-handler.js");

const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

DBControl.Connect(
    Config.Database_Host,
    Config.Database_User,
    Config.Database_Password,
    Config.Database_Name
);

app.post("/register", [
    APIHandler.RegisterUser
]);

app.get("/user/:userID", [
    APIHandler.FindUserID
]);

app.post("/user", [
    APIHandler.FindUserEmail
]);

app.post("/validate", [
    APIHandler.ValidateLogin
]);

app.listen(Config.PORT, () => {
    console.log(`App listening on port ${Config.PORT}!`);
});