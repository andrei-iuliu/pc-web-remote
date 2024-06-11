const bcrypt = require('bcrypt');
const fs = require('fs');

const saltRounds = 10;
const username = 'admin';
const password = 'admin'; // Replace with the desired password

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    const users = {
        [username]: hash
    };
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    console.log('User added with hashed password');
});