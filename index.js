const Config  = require("./config.json");
const DBLogin = require("./db-login.json");

const DBControl  = require("./database/database.js");
const APIHandler = require("./api_handler/api-handler.js");

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

DBControl.Connect(
    DBLogin.Database_Host,
    DBLogin.Database_User,
    DBLogin.Database_Password,
    DBLogin.Database_Name
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