const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t3yv0bn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const taskCollection = client.db("TaskDb").collection("tasks");
    const myTaskCollection = client.db("TaskDb").collection("myTasks");

    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get("/mytask", async (req, res) => {
      const email = req.query.email;
      console.log("Received Email (Backend):", email);
      const query = { email: email };
      const result = await myTaskCollection.find(query).toArray();
      console.log("Result from Database:", result);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const createTask = req.body;
      const result = await taskCollection.insertOne(createTask);
      res.send(result);
    });
    app.post("/mytasks", async (req, res) => {
      const createTask = req.body;
      const result = await myTaskCollection.insertOne(createTask);
      res.send(result);
    });

    app.get("/mytasks/:id",async(req,res)=>{
      const id= req.params.id;
      const query = {_id: new ObjectId(id)}
      const result= await myTaskCollection.findOne(query);
      res.send(result)
    })

    app.patch("/mytasks/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: item.title,
          deadline: item.deadline,
          description: item.description,
          priority: item.priority,
        },
      };
      const result = await myTaskCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/mytasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await myTaskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task management server");
});

app.listen(port, () => {
  console.log(`task management server is running on port ${port}`);
});
