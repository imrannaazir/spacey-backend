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

//connect with mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.l768r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */

//start async function
(async function run() {
    try {
        await client.connect();
        const rocketCollection = client.db("spacey").collection("rockets")

        //get all rockets api
        app.get('/rockets', async (req, res) => {
            const query = {};
            const cursor = rocketCollection.find(query);
            const rockets = await cursor.toArray();
            res.send(rockets)
        });
        //get one rocket api
        app.get('/rockets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const rocket = await rocketCollection.findOne(query);

            res.send(rocket)
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
            const id = req.params
            const updatedRocket = req.body;
            const query = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: updatedRocket
            };
            console.log('updatedRocket', updatedDoc, 'query', query, 'option', option);
            const result = await rocketCollection.updateOne(query, updatedDoc, option)
            res.send(result)


        });


        // post a data api
        app.post('/rockets', async (req, res) => {
            const newRockets = req.body;
            const result = await rocketCollection.insertOne(newRockets);
            res.send(result);
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

