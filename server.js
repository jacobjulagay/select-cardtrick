const express = require('express'); // Web server for node.js
const app = express(); // use webserver in app
const path = require('path') // get rootpath where stored in
const bodyParser = require('body-parser'); // extracts full body. Makes simpler to get forms from data
const mongodb = require('mongodb'); // Interaction with mongodb
const MongoClient = mongodb.MongoClient;
const URI = process.env.MONGODB_URI || 'mongodb://localhost/database'; // Where database is stored
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); // Send forms data to server

//Getting form data from secret file 
app.get('/secret', (req,res) => res.sendFile(path.join(_dirname , 'secret.html')));

//Posting form data from secret file to db. Connecting with DB
app.post('secret',(req, res) => {
    MongoClient.connect(URI, {useNewURLParser: true}, (err, client) => {
        if(err){
            console.log(err);
        }
        else{
            const db = client=db(DB_NAME); // Connecting to database name
            const collection = db.collection('names') // Getting names
            const entry ={
                name: req.body.name.toLowerCase(),//Getting name and convert to lowercase
                card: req.body.number + '_of_' + req.body.suit
            };
            collection.insertOne(entry, (err,result) => {
                if(err){
                    console.log(err)
                }else{
                    res.send('Inserted into database')
                }
            })
            client.close();
        }

    })

})
app.get('/:param* ', (req,res) =>{
    const name = req.url.slice(1).toLowerCase(); // slice url to just get index 1, which is the name
    MongoClient.connect(URI, {useNewUrlParser: true}, (err, client) =>{
        if(err){
            console.log(err);
        }else{
            const db  = client.db(DB_NAME);
            const collection = db.collection('names');

            if(name === 'deleteAll'){
                collection.remove({}) //Removes everything if you pass empty object
                res.send('database reset');
            } else{
                collection.find({name: name}).toArray((err, result) => {
                    if(err){
                        console.log(err)
                    }else if(result.length){
                        const card = result[result.length-1].card + '.png'
                        res.sendFile(path.join(_dirname+ '/cards/' + card));

                    }
                    else{
                        res.sendStatus(404);
                    }
                    client.close();
                })
            }
        }
    })
})

app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`))