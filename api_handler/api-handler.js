const Tokens    = require("../tokens.json");
const DBControl = require("../database/database.js");

const crypto = require("crypto");
const jwt    = require("jsonwebtoken");

function GenerateJWT(userID, loginTime) {
    return jwt.sign(
        {
            userID: userID
        },
        Tokens.JWT_Secret + loginTime,
        {expiresIn: "1d"}
    );
}

async function CreateUser(firstName, lastName, email, password, permissionLevel) {
    permissionLevel = permissionLevel || 0;

    // Invalid first name
    if (typeof firstName !== "string" || !firstName || firstName == "") {
        return {StatusCode: 400, Error: "Ugyldig fornavn!"};
    }

    // Invalid last name
    if (typeof lastName !== "string" || !lastName || lastName == "") {
        return {StatusCode: 400, Error: "Ugyldig etternavn!"};
    }

    // Invalid email
    if (typeof email !== "string" || !email || email == "") {
        return {StatusCode: 400, Error: "Ugyldig epost adresse!"};
    }

    // Invalid password
    if (typeof password !== "string" || !password || password == "") {
        return {StatusCode: 400, Error: "Ugyldig passord!"};
    }

    // Not viken email
    if (/@viken.no\s*$/.test(email.trim().toLowerCase()) == false) {
        return {StatusCode: 400, Error: "Bruk @viken.no epost!"};
    }

    // Invalid permission level
    if (typeof permissionLevel !== "number" || permissionLevel < 0 || permissionLevel > 99) {
        return {StatusCode: 400, Error: "Ugyldig tillatelsesnivå!"};
    }


    const verifiedEmail = email.trim().toLowerCase();
    if ((await DBControl.FindUserEmail(verifiedEmail)).length > 0) {
        return {StatusCode: 400, Error: `Bruker med epost ${verifiedEmail} eksisterer allerede!`};
    }

    let salt = crypto.randomBytes(32);
    let hash;
    try {
        salt = salt.toString("base64");
        hash = crypto.scryptSync(password, salt, 256).toString("base64");
    } catch {
        return {StatusCode: 500, Error: "Problem ved kryptering av passord!"};
    }

    // Total stored password length of 389 characters
    const hashedPassword = hash + "$" + salt;

    const createdUser = await DBControl.CreateUser([firstName, lastName, verifiedEmail, hashedPassword, permissionLevel]);

    if (!createdUser) {
        return {StatusCode: 500, Error: "Problem ved opprettelse av konto!"};
    }

    return {StatusCode: 201, userID: createdUser.insertId};
}

exports.CreateUser = async (request, response) => {
    if (request.body.constructor === Object && Object.keys(request.body).length === 0) {
        response.status(400).send({"Error": "Ingen data for å opprette konto!"});
        return;
    }
    
    const newUserID = await CreateUser(
        request.body.firstName,
        request.body.lastName,
        request.body.email,
        request.body.password,
        request.body.permissionLevel
    );

    if (newUserID.Error) {
        response.status(newUserID.StatusCode).send({"Error": newUserID.Error});
        return;
    }

    response.status(newUserID.StatusCode).send({"userId": newUserID.userID});
}

exports.RegisterUser = async (request, response) => {
    request.body.permissionLevel = 1;
    
    const newUserID = await CreateUser(
        request.body.firstName,
        request.body.lastName,
        request.body.email,
        request.body.password,
        request.body.permissionLevel
    );

    if (newUserID.Error) {
        response.status(newUserID.StatusCode).send({"Error": newUserID.Error});
        return;
    }

    const foundUser = await DBControl.FindUserID(newUserID.userID);

    if (foundUser.Error || foundUser.length <= 0) {
        console.log(foundUser.Error);
        response.status(201).end();
        return;
    }

    const newUser = foundUser[0];

    const loginTime = Date.now().toString();

    DBControl.UpdateUserLoginTime(newUser.userID, loginTime);
    
    const token = GenerateJWT(newUser.userID, loginTime);

    response.cookie("authorization", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60
    });

    response.cookie("userId", newUser.userID, {
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 30
    });

    response.status(201).send({"userId": newUser.userID});
}

exports.FindUserID = async (request, response) => {
    const userID = request.params.userID;
    if (!userID) {
        response.status(400).send({"Error": "Mangler bruker ID!"});
        return;
    }

    const foundUser = await DBControl.FindUserID(userID);

    if (foundUser.Error) {
        console.log(foundUser.Error);
        response.status(500).send({"Error": foundUser.Error});
        return;
    }

    if (foundUser.length <= 0) {
        response.status(200).send({});
        return;
    }

    response.status(200).send(foundUser[0]);
}

exports.FindUserEmail = async (request, response) => {
    const email = request.body.email;
    if (!email || email == "") {
        response.status(400).send({"Error": "Mangler epost!"});
        return;
    }

    const foundUser = await DBControl.FindUserEmail(email);

    if (foundUser.Error) {
        response.status(500).send({"Error": foundUser.Error});
        return;
    }

    if (foundUser.length <= 0) {
        response.status(200).send({});
        return;
    }
    
    response.status(200).send(foundUser[0]);
}

exports.ValidateLogin = async (request, response) => {
    let enteredEmail    = request.body.email;
    let enteredPassword = request.body.password;

    // Invalid email
    if (typeof enteredEmail !== "string" || !enteredEmail || enteredEmail == "") {
        response.status(400).send({"Error": "Ugyldig epost adresse!"});
        return;
    }

    // Invalid password
    if (typeof enteredPassword !== "string" || !enteredPassword || enteredPassword == "") {
        response.status(400).send({"Error": "Ugyldig passord!"});
        return;
    }

    enteredEmail = enteredEmail.trim().toLowerCase();
    const user   = await DBControl.FindUserEmail(enteredEmail);

    if (user.Error) {
        response.status(500).send({"Error": user.Error});
        return;
    }

    if (user.length <= 0) {
        response.status(200).send({"Error": `Bruker med epost ${enteredEmail} eksisterer ikke!`});
        return;
    }


    const userInfo       = await DBControl.GetFullUserInfo(user[0].userID);
    const passwordSalt   = userInfo[0].password.split("$");
    const hashedPassword = passwordSalt[0];
    const salt           = passwordSalt[1];

    try {
        enteredPassword = crypto.scryptSync(enteredPassword, salt, 256).toString("base64");
    } catch {
        response.status(500).send({"Error": "Problem ved validering av passord!"});
        return;
    }

    if (enteredPassword !== hashedPassword) {
        response.status(401).send({"Error": "Ugyldig passord!"});
        return;
    }

    const loginTime = Date.now().toString();

    DBControl.UpdateUserLoginTime(userInfo[0].userID, loginTime);
    
    const token = GenerateJWT(userInfo[0].userID, loginTime);

    response.cookie("authorization", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60
    });

    response.cookie("userId", userInfo[0].userID, {
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 30
    });

    response.status(200).send({"userId": userInfo[0].userID});
}

exports.ValidateToken = async (request, response, next) => {
    const token  = request.cookies.authorization;
    const userID = request.cookies.userId;

    if (!token || !userID) {
        response.status(400).send({"Error": "Ugyldig sesjon!"});
        return;
    }

    const loginTime = await DBControl.GetUserLoginTime(userID);

    if (loginTime.Error || loginTime.length <= 0) {
        response.clearCookie("authorization");
        response.clearCookie("userId");
        response.status(500).send({"Error": "Problemer med verifisering av konto."});
        return;
    }

    jwt.verify(token, Tokens.JWT_Secret + loginTime.loginTime, (error, decoded) => {
        if (error) {
            response.clearCookie("authorization");
            response.clearCookie("userId");
            response.status(400).send({"Error": "Ugyldig sesjon!"});
            return;
        }
    });

    next();
}