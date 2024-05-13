const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};
module.exports.setUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.sendMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const sender = await User.findById(from);
    const recipient = await User.findById(to);
    if (!sender || !recipient) {
      return res.status(404).json({ msg: "Sender or recipient not found" });
    }
    if (recipient.status === "BUSY") {
      const response = await generateResponseFromLLM();
      return res.json({ msg: response });
    } else {
      return res.json({ msg: "User is now available"})
    }
  } catch (ex) {
    next(ex);
  }
};

const generateResponseFromLLM = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Sorry, the user is currently busy.");
    }, 10000); 
  });
};

// const openaiApiKey = "";
// const fetchLLMAPIResponse = async () => {
//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/completions",
//       {
//         model: "text-davinci-003", 
//         prompt: "Translate the following English text to French: Hello, how are you?",
//         max_tokens: 50,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${openaiApiKey}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching response from OpenAI:", error);
//     return await fetchLLMAPIResponse();
//   }
// };



module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
