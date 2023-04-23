const Config  = require("./config.json");
const DBLogin = require("./db-login.json");

const DBControl  = require("./database/database.js");
const APIHandler = require("./api_handler/api-handler.js");

const express      = require("express");
const cors         = require("cors");
const rateLimit    = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const standardLimit = rateLimit({
    windowMs        : 1 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders   : false,
    message         : "For mange forespørsler! Vent en time og prøv igjen!",
    max             : async (request) => {
        const hasPermission = await APIHandler.HasPermission(request.cookies.userId, Config.Permission.TEACHER);

        if (hasPermission) return 0;

        return 1_000;
    },
});

// TODO: make signup limit and activity join/leave limit.

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

/*== USER API ==*/

// User signup
app.post("/register", [
    APIHandler.RegisterUser
]);

// Get basic info about a specific user through their ID
app.get("/user/:userID", [
    APIHandler.FindUserID
]);

// Get user info by email
app.post("/user", [
    APIHandler.FindUserEmail
]);

// Join a specific activity
app.post("/user/:activityID/join", [
    APIHandler.ValidateToken,
    APIHandler.ActivityJoin
]);

// Leave a specific activity
app.delete("/user/:activityID/quit", [
    APIHandler.ValidateToken,
    APIHandler.ActivityQuit
]);

app.post("/login", [
    APIHandler.ValidateLogin
]);


/*== VALIDATION API ==*/

// Validate a users token
app.post("/validate", [
    APIHandler.ValidateToken
]);


/*== ACTIVITY API ==*/

// Create a new activity
app.post("/activity", [
    APIHandler.ValidateToken
]);

// Get info about a specific activity
app.get("/activity/:activityID", [

]);

// Update a specific activity's name
app.patch("/activity/:activityID/name", [
    APIHandler.ValidateToken
]);

// Update a specific activity's description
app.patch("/activity/:activityID/description", [
    APIHandler.ValidateToken
]);

// Update a specific activity's date
app.patch("/activity/:activityID/date", [
    APIHandler.ValidateToken
]);

// Update a specific activity's host
app.patch("/activity/:activityID/host", [
    APIHandler.ValidateToken
]);

// Delete a specific activity
app.delete("/activity/:activityID", [
    APIHandler.ValidateToken
]);


app.listen(Config.PORT, () => {
    console.log(`App listening on port ${Config.PORT}!`);
});