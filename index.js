const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

let open_temp_data = new Map();
let protected_temp_data = new Map();

const { PASSCODE, PORT } = process.env;

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.get("/body", (req, res) => {
    res.json(req.body);
});

app.post("/data", (req, res) => {
    const { data, passcode, protect, perma } = req.body;

    if (data) {
        let db = protect ? protected_temp_data : open_temp_data;

        //check if there's a passcode if yes then
        //if it's correct then change the db to protected else send error
        if (passcode !== PASSCODE) {
            res.status(400).send("Invalid value");
            return;
        }

        //Create an empty object and populate with ordered data
        Object.entries(data).forEach((element) => {
            const kv = element[1]; //get the key value pair or object
            const key = Object.keys(kv)[0];
            const value = Object.values(kv)[0];

            db.set(key, value || null);
        });

        res.status(200).send("done");
        return;
    }

    res.status(400).send("Bad request");
    // res.json(req.body);
});

app.get("/data", (req, res) => {
    const { data, passcode, perma } = req.body;

    if (data) {
        let db = open_temp_data;

        //check if there's a passcode if yes then
        //if it's correct then change the db to protected else send error

        if (passcode) {
            if (passcode === PASSCODE) {
                db = protected_temp_data;
            } else {
                res.status(400).send("Invalid value");
                return;
            }
        }

        //Create an empty object and populate with ordered data
        let resObj = {};
        data.forEach((element) => {
            resObj[element] = db.get(element) || null;
        });

        res.status(200).json({ data: resObj });
        return;
    }

    res.status(400).send("Bad request");
    // res.json(req.body);
});

app.listen(PORT, () => {
    console.log("Listening on ", PORT);
});
