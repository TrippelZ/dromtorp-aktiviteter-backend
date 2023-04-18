const mysql = require("mysql");

let database;

exports.Connect = (host, user, password, databaseName) => {
    database = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: databaseName,
    });

    database.connect((error) => {
        if (error) throw error;
        console.log(`Connected to database ${databaseName} on host ${host}!`);
    });
}

exports.CreateUser = (userInfo) => {
    const query = "INSERT INTO `users`(`firstName`, `lastName`, `email`, `password`, `permissionLevel`) VALUES (?, ?, ?, ?, ?)";

    return new Promise((resolve) => {
        database.query(query, userInfo, (error, result) => {
            if (error) {
                console.error(error);
                resolve(false);
            }

            resolve(result);
        });
    });
}

exports.FindUserID = (id) => {
    if (!id) return {Error: "Missing user ID!"};

    const query = "SELECT `userID`, `firstName`, `lastName`, `email`, `permissionLevel` FROM `users` WHERE `userID`=?";

    return new Promise((resolve) => {
        database.query(query, [id], (error, result) => {
            if (error) {
                resolve({Error: error});
            }

            resolve(result);
        });
    });
}

exports.FindUserEmail = (email) => {
    if (!email) return {Error: "Missing email!"};

    const query = "SELECT `userID`, `firstName`, `lastName`, `email`, `permissionLevel` FROM `users` WHERE `email`=?";

    return new Promise((resolve) => {
        database.query(query, [email], (error, result) => {
            if (error) {
                resolve({Error: error});
            }
            
            resolve(result);
        });
    });
}

exports.GetFullUserInfo = (userID) => {
    if (!userID || typeof userID !== "number") {
        return {Error: "Missing valid user ID!"};
    }

    const query = "SELECT * FROM `users` WHERE `userID`=?";

    return new Promise((resolve) => {
        database.query(query, [userID], (error, result) => {
            if (error) {
                resolve({Error: error});
            }
            
            resolve(result);
        });
    });
}

exports.GetUserLoginTime = (userID) => {
    if (!userID || typeof userID !== "number") {
        return {Error: "Ugyldig bruker ID!"};
    }

    const query = "SELECT `loginTime` FROM `users` WHERE `userID`=?";

    return new Promise((resolve) => {
        database.query(query, [userID], (error, result) => {
            if (error) {
                resolve({Error: error});
            }
            
            resolve(result);
        });
    });
}

exports.UpdateUserLoginTime = (userID, loginTime) => {
    if (!userID || typeof userID !== "number") {
        return {Error: "Missing valid user ID!"};
    }

    const query = "UPDATE `users` SET `loginTime`=? WHERE `userID`=?";

    return new Promise((resolve) => {
        database.query(query, [loginTime, userID], (error, result) => {
            if (error) {
                resolve({Error: error});
            }
            
            resolve(result);
        });
    });
}