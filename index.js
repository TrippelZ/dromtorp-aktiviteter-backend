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
    message         : "For mange forespørsler! Prøv igjen senere!",
    max             : async (request) => {
        const hasPermission = await APIHandler.HasPermission(request.cookies.userId, Config.Permission.TEACHER);

        if (hasPermission) return 0;

        return 120;
    }
});

const signupLimit = rateLimit({
    windowMs        : 30 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders   : false,
    message         : "For mange forespørsler! Prøv igjen senere!",
    max             : 50
});

const loginLimit = rateLimit({
    windowMs        : 10 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders   : false,
    message         : "For mange forespørsler! Prøv igjen senere!",
    max             : 25
});

const activityLimit = rateLimit({
    windowMs        : 1 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders   : false,
    message         : "For mange forespørsler! Prøv igjen senere!",
    max             : 60
});

const updateLimit = rateLimit({
    windowMs        : 1 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders   : false,
    message         : "For mange forespørsler! Prøv igjen senere!",
    max             : 30
});


const app = express();
app.use(cors({ origin: Config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(standardLimit);


DBControl.Connect(
    DBLogin.Database_Host,
    DBLogin.Database_User,
    DBLogin.Database_Password,
    DBLogin.Database_Name
);

/*== USER API ==*/

// User signup
app.post("/register", [
    signupLimit,
    APIHandler.RegisterUser
]);

// Get basic info about a specific user through their ID
app.get("/user/:userID", [
    APIHandler.ValidateToken,
    APIHandler.FindUserID
]);

// Get get the activities a specific user has joined
app.get("/user/:userID/activities", [
    APIHandler.ValidateToken,
    APIHandler.GetUserActivities
]);

// Get the users permission level
app.get("/user/:userID/permissions", [
    APIHandler.ValidateToken,
    APIHandler.GetUserPermissionLevel
]);

// Get user info by email
app.post("/user", [
    APIHandler.ValidateToken,
    APIHandler.FindUserEmail
]);

// Update a users full name
app.patch("/user/:userID/name", [
    updateLimit,
    APIHandler.ValidateToken,
    APIHandler.UpdateUserName
]);

// Update a users email
app.patch("/user/:userID/email", [
    updateLimit,
    APIHandler.ValidateToken,
    APIHandler.UpdateUserEmail
]);

// Update a users password
app.patch("/user/:userID/password", [
    updateLimit,
    APIHandler.ValidateToken,
    APIHandler.UpdateUserPassword
]);

// Join a specific activity
app.post("/user/:activityID/join", [
    activityLimit,
    APIHandler.ValidateToken,
    APIHandler.ActivityJoin
]);

// Leave a specific activity
app.delete("/user/:activityID/quit", [
    activityLimit,
    APIHandler.ValidateToken,
    APIHandler.ActivityQuit
]);

app.post("/login", [
    loginLimit,
    APIHandler.ValidateLogin
]);

app.post("/logout", [
    loginLimit,
    APIHandler.ValidateToken,
    APIHandler.Logout
]);

// Delete a user - UNFINISHED, database needs to remove activities related to user!!!
/*app.delete("/user/:userID", [
    updateLimit,
    APIHandler.ValidateToken,
    APIHandler.DeleteUser
]);*/


/*== VALIDATION API ==*/

// Validate a users token
app.post("/validate", [
    APIHandler.ValidateToken,
    APIHandler.TokenIsValid
]);


/*== ACTIVITY API ==*/

// Create a new activity
app.post("/activity", [
    APIHandler.ValidateToken,
    APIHandler.CreateActivity
]);

// Get info about a specific activity
app.get("/activity/:activityID", [
    APIHandler.ValidateToken,
    APIHandler.GetActivityById
]);

// Get the users that have joined a specific activity
app.get("/activity/:activityID/members", [
    APIHandler.ValidateToken,
    APIHandler.GetActivityMembers
]);

// Get all activities
app.get("/activity", [
    APIHandler.ValidateToken,
    APIHandler.GetAllActivities
]);

// Update a specific activity's name
app.patch("/activity/:activityID/name", [
    APIHandler.ValidateToken,
    APIHandler.UpdateActivityName
]);

// Update a specific activity's description
app.patch("/activity/:activityID/description", [
    APIHandler.ValidateToken,
    APIHandler.UpdateActivityDescription
]);

// Update a specific activity's date
app.patch("/activity/:activityID/date", [
    APIHandler.ValidateToken,
    APIHandler.UpdateActivityDate
]);

// Update a specific activity's host
app.patch("/activity/:activityID/host", [
    APIHandler.ValidateToken,
    APIHandler.UpdateActivityHost
]);

// Delete a specific activity
app.delete("/activity/:activityID", [
    APIHandler.ValidateToken,
    APIHandler.DeleteActivity
]);


app.listen(Config.PORT, () => {
    console.log(`App listening on port ${Config.PORT}!`);
});