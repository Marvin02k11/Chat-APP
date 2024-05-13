const express = require("express");
// const router1 = express.Router();
// const { setUserStatus } = require("../controllers/userController");

// router.post("/setstatus", setUserStatus);
const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);

module.exports = router;
// module.exports = router1;
