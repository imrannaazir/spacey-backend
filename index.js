// import or require
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');



// use middle ware
app.use(cors());
app.use(express.json());



// jwt function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    else {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send({ message: 'access forbidden' })
            }
            else {
                req.decoded = decoded
                next()
            };
        });
    };
};




//connect with mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.l768r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



//start async function
(async function run() {
    try {
        await client.connect();
        const rocketCollection = client.db("spacey").collection("rockets")


        //get my rockets api
        app.get('/myrockets', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = rocketCollection.find(query);
                const rockets = await cursor.toArray();
                res.send(rockets);
            }
            else {
                res.status(403).send({ message: 'access forbidden' })
            };
        });


        //get all rockets api
        app.get('/rockets', async (req, res) => {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const query = {};
            const cursor = rocketCollection.find(query);
            let rockets;
            if (page || limit) {
                rockets = await cursor.skip(page * limit).limit(limit).toArray();
            }
            else {
                rockets = await cursor.toArray();
            }
            res.send(rockets)
        });


        //get one rocket api
        app.get('/rockets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const rocket = await rocketCollection.findOne(query);
            res.send(rocket)
        });
        
         //get one drone api
        app.get('/drones', async (req, res) => {
            const query = { category: "drone" };
            const rocket = await rocketCollection.find(query).toArray();
            res.send(rocket)
        });



        //get all products count
        app.get('/rocketsCount', async (req, res) => {
            const count = await rocketCollection.estimatedDocumentCount();
            res.send({ count })
        })



        // get access token api 
        app.post('/login', async (req, res) => {
            const email = req.body;
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken });
        });


        //Post one rockets api
        app.post('/rockets', async (req, res) => {
            const newRockets = req.body;
            const result = await rocketCollection.insertOne(newRockets);
            res.send(result);
        });



        //delete a rocket api
        app.delete('/rockets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await rocketCollection.deleteOne(query);
            res.send(deleted);
        });


        //created put api 
        app.put('/rockets/:id', async (req, res) => {
            const updatedRocket = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: updatedRocket
            };
            const result = await rocketCollection.updateOne(query, updatedDoc, option)
            res.send(result)
        });


    }
    finally {

    }
})()


// root api
app.get('/', (req, res) => {
    res.send('I am from back end.')
})

app.listen(port, () => {
    console.log('The voice of express is sweet.');
})
