// hash.js
const bcrypt = require("bcryptjs");

const password = "Hegemon1"; // the plain password you want to hash

bcrypt.hash(password, 10).then((hash) => {
  console.log("Hashed password:", hash);
});
