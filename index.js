require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://flash-writer.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
}));

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "You are Chat Assistant. Your name is Flash Writer. Always try to give the answer less than 300 words.Remember at least last 5 conversations." });

// systemInstruction: "You are a Meme generator. Your name is MemeBuzz. You will always generate short meme", 





const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.lgngp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const db = client.db('Flash-Writer');
        const usersCollection = db.collection('Users');

        app.get('/', (req, res) => {
            res.send({ Message: "Crack-Ai" });
        })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const data = req.body;
            const { userEmail } = data;

            try {
                const existingUser = await usersCollection.findOne({ userEmail });

                if (existingUser) {
                    return res.status(400).send({ message: 'User Already Exist.' });
                }

                const result = await usersCollection.insertOne(data);
                res.send(result);

            } catch (error) {
                res.status(500).send({ message: 'Server Error.' });
            }
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.find({ userEmail: email }).toArray();
            res.send(result);
        })


        app.get('/test-ai', async (req, res) => {
            const prompt = req.query?.prompt;
            if (!prompt) {
                res.send({ message: 'Please Provide any text!' });
                return;
            }
            const result = await model.generateContent(prompt);
            const finalData = result.response.text();
            const output = finalData.replace(/\*/g, "");
            const finalOutput = output.replace(/(\d+\.)/g, '\n$1');
            res.send(finalOutput);
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// app.get('/image-to-text', async(req, res)=>{
//     const prompt = req.query?.prompt;
//     if(!prompt){
//         res.send({message: 'Please Provide any text!'});
//         return;
//     }

//     const imageResp = await fetch(prompt).then((response) => response.arrayBuffer());

//     const result = await model.generateContent([
//         {
//             inlineData: {
//                 data: Buffer.from(imageResp).toString("base64"),
//                 mimeType: "image/jpeg",
//             },
//         },
//         'generate meme based on picture.',
//     ]);
//     // console.log(result.response.text());


//     // const result = await model.generateContent(prompt);
//     const finalData = result.response.text();
//     // console.log();
//     const output = finalData.replace(/\*/g, "");

//     res.send(output);
// })


app.listen(port, () => {
    console.log(`Server is running at PORT: ${port}`);
});