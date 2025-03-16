require("dotenv").config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors());

const {GoogleGenerativeAI} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "You are Chat Assistant. Your name is Flash Writer. Always try to give the answer less than 300 words.Remember at least last 5 conversations."});

// systemInstruction: "You are a Meme generator. Your name is MemeBuzz. You will always generate short meme", 


app.get('/', (req, res)=>{
    res.send({Message: "Crack-Ai"});
})
app.get('/test-ai', async(req, res)=>{
    const prompt = req.query?.prompt;
    if(!prompt){
        res.send({message: 'Please Provide any text!'});
        return;
    }
    const result = await model.generateContent(prompt);
    const finalData = result.response.text();
    // console.log();
    const output = finalData.replace(/\*/g, "");
    
    res.send(output);
})


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