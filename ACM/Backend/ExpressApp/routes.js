// Links:
// https://github.com/scalablescripts/node-auth/blob/main/routes/routes.js   https://www.youtube.com/watch?v=IxcKMcsBGE8&list=PLlameCF3cMEsjpIRxfB9Rjici3aMCaQVo&index=2&ab_channel=ScalableScripts

require('dotenv').config({ path: '../.env' })

const router = require('express').Router();
const jwt = require("jsonwebtoken");
const readLastLines = require('read-last-lines');

const logger = require('../Logs/logger');

const ipReqMonitor = {};        // Store IPs and number of attempts.
const maxNumberOfAttempts = 5;
const waitTime = 10*1000;
let timeoutInterval = null;
let start, stop;

router.post('/login', (req, res) => {
    const USERNAME = process.env.WEB_USERNAME;
    const PASSWORD = process.env.WEB_PASSWORD;
    
    const ip = req.headers['x-forwarded-for'] || req.ip.split(':')[3];// || req.connection.remoteAddress.split(":")[3];
    const {username, password} = req.body;
    
    // If is a new ip, create entry object with ip as key.
    if((ip in ipReqMonitor == false)){
        ipReqMonitor[ip] = {numberOfAttempts: maxNumberOfAttempts};
    }

    if(ipReqMonitor[ip].numberOfAttempts > 0){
        if(username === USERNAME && password === PASSWORD){
            const user = {id: 1, username: 'pi'};
            const token = jwt.sign(user, process.env.WEB_JWT_KEY);
            res.status(200);
            res.json({user, token});
            // Delete key from object.
            delete ipReqMonitor[ip];
            console.log(`INFO: IP ${ip} logged in.`);
            return;
        }
        else{
            ipReqMonitor[ip].numberOfAttempts = ipReqMonitor[ip].numberOfAttempts - 1;
            //logger.debug(ipReqMonitor);
            // If no more attempts available, block for a period of time.
            if(ipReqMonitor[ip].numberOfAttempts == 0){
                console.log(`WARNING: Too many attempts from IP ${ip}.`);
                start = Date.now();
                timeoutInterval = setTimeout(() => {
                    // After timeout reset number of attempts for this ip.
                    ipReqMonitor[ip].numberOfAttempts = maxNumberOfAttempts;
                    clearTimeout(timeoutInterval);
                    timeoutInterval = null;
                }, waitTime);
                stop = Date.now();
                res.status(403);
                res.json({
                    message: `Too many attempts, please wait ${((waitTime - (stop - start))/1000).toFixed(0)} sec.`,
                    attemptsAvailable: ipReqMonitor[ip].numberOfAttempts,
                    remainingTime: (waitTime - (stop - start))/1000,
                });
            }
            else{
                res.status(403);
                res.json({
                    message: "Wrong credentials, try again.",
                    attemptsAvailable: ipReqMonitor[ip].numberOfAttempts,
                    remainingTime: 0
                });
            }
        }
    }
    else{
        // If maximum number of attempts is reached, don't do anything..
        //console.log(ipReqMonitor);
        stop = Date.now()
        res.status(403);
        res.json({
            message: `Too many attempts, please wait ${((waitTime - (stop - start))/1000).toFixed(0)} sec.`,
            attemptsAvailable: ipReqMonitor[ip].numberOfAttempts,
            remainingTime: (waitTime - (stop - start))/1000,
        });
    }
});

router.get('/logs/info', (req, res) => {
    res.status(200);
    res.contentType('application/text');
    readLastLines.read('/home/pi/Code/RPi4Node/ACM/Backend/Logs/info.log', 100)
	    .then((lines) => {
            res.send(lines)
    });
});

router.get('/logs/errors', (req, res) => {
    res.status(200);
    res.contentType('application/text');
    readLastLines.read('/home/pi/Code/RPi4Node/ACM/Backend/Logs/error.log', 100)
	    .then((lines) => {
            res.send(lines)
    });
});

router.get('/api/info', (req, res) => {
    res.status(200);
    res.contentType('application/json');
    res.send(JSON.stringify({ip: '200.200.200.200'}));
});

module.exports = router;