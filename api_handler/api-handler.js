const DBControl  = require("../database/database.js");

const crypto = require("crypto");

exports.CreateUser = (request, response) => {
    const firstName       = request.body.firstName;
    const lastName        = request.body.lastName;
    const email           = request.body.email;
    const password        = request.body.password;
    const permissionLevel = request.body.permissionLevel || 0;


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


    const verifiedEmail = email.trim().toLowerCase();
    if (await (DBControl.FindUserEmail(verifiedEmail)).length <= 0) {
        response.status(400).send({"Error": `Bruker med epost ${verifiedEmail} eksisterer allerede!`});
        return;
    }

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