const DBControl  = require("../database/database.js");

const crypto = require("crypto");
const jwt    = require("jsonwebtoken");

exports.CreateUser = async (request, response) => {
    const firstName       = request.body.firstName;
    const lastName        = request.body.lastName;
    const email           = request.body.email;
    const password        = request.body.password;
    const permissionLevel = request.body.permissionLevel || 0;


    if (request.body.constructor === Object && Object.keys(request.body).length === 0) {
        response.status(400).send({"Error": "Ingen data for å opprette konto!"});
        return;
    }
    
    // Invalid first name
    if (typeof firstName !== "string" || !firstName || firstName == "") {
        response.status(400).send({"Error": "Ugyldig fornavn!"});
        return;
    }

    // Invalid last name
    if (typeof lastName !== "string" || !lastName || lastName == "") {
        response.status(400).send({"Error": "Ugyldig etternavn!"});
        return;
    }

    // Invalid email
    if (typeof email !== "string" || !email || email == "") {
        response.status(400).send({"Error": "Ugyldig epost adresse!"});
        return;
    }

    // Invalid password
    if (typeof password !== "string" || !password || password == "") {
        response.status(400).send({"Error": "Ugyldig passord!"});
        return;
    }

    // Not viken email
    if (/@viken.no\s*$/.test(email.trim().toLowerCase()) == false) {
        response.status(400).send({"Error": "Bruk @viken.no epost!"});
        return;
    }

    // Invalid permission level
    if (typeof permissionLevel !== "number" || permissionLevel < 0 || permissionLevel > 99) {
        response.status(400).send({"Error": "Ugyldig tillatelsesnivå!"});
        return;
    }


    const verifiedEmail = email.trim().toLowerCase();
    if ((await DBControl.FindUserEmail(verifiedEmail)).length > 0) {
        response.status(400).send({"Error": `Bruker med epost ${verifiedEmail} eksisterer allerede!`});
        return;
    }

    let salt = crypto.randomBytes(32);
    let hash;
    try {
        salt = salt.toString("base64");
        hash = crypto.scryptSync(password, salt, 256).toString("base64");
    } catch {
        response.status(500).send({"Error": "Problem ved kryptering av passord!"});
        return;
    }

    // Total stored password length of 389 characters
    const hashedPassword = hash + "$" + salt;

    const createdUser = await DBControl.CreateUser([firstName, lastName, verifiedEmail, hashedPassword, permissionLevel]);

    //console.log(createdUser);

    if (!createdUser) {
        response.status(502).send({"Error": "Problem ved opprettelse av konto!"});
        return;
    }

    response.status(201).send({"userId": createdUser.insertId});
}

exports.RegisterUser = async (request, response) => {
    request.body.permissionLevel = 1;
    exports.CreateUser(request, response);
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
        response.status(502).send({"Error": foundUser.Error});
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
        response.status(502).send({"Error": foundUser.Error});
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
        response.status(502).send({"Error": user.Error});
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

    const token = jwt.sign(
        {
            userID   : userInfo[0].userID,
            email    : userInfo[0].email,
            password : userInfo[0].password
        },
        
    );

    response.status(200).send({"userId": userInfo[0].userID});
}