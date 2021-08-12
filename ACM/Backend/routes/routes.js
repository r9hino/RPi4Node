// Links:
// https://github.com/scalablescripts/node-auth/blob/main/routes/routes.js   https://www.youtube.com/watch?v=IxcKMcsBGE8&list=PLlameCF3cMEsjpIRxfB9Rjici3aMCaQVo&index=2&ab_channel=ScalableScripts

require('dotenv').config({ path: '../.env' })

const router = require('express').Router();
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
    const USERNAME = process.env.WEB_USERNAME;
    const PASSWORD = process.env.WEB_PASSWORD;
  
    const {username, password} = req.body;

    console.log(username, password);

    if(username === USERNAME && password === PASSWORD){
        const user = {
            id: 1,
            username: "pi",
        };
        const token = jwt.sign(user, process.env.WEB_JWT_KEY);
        res.json({
            user,
            token,
        });
    }
    else{
        res.status(403);
        res.json({
            message: "Wrong login information.",
        });
    }
});

module.exports = router;