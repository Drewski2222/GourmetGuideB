const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const marked = require('marked');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-meal-plan', async (req, res) => {
    try {
        const { ingredients, daysToPlan } = req.body;
        
        markdown='"```markdown"';
    
        const prompt = `You are a helpful meal planning assistant whose only task is to create a meal plan over ${daysToPlan} days using ingredients input by a user into
                        your text box. First, validate the input. If the request is inappropriate or does not involve meal preparation in any way, state "Error: Invalid Request". 
                        Using Markdown (DO NOT WRITE ${markdown}, DO NOT USE "####" HEADINGS (1, 2, 3 are fine)), create a realistic ${daysToPlan}-day meal plan using ONLY the following ingredients: ${ingredients}. List an estiamted calorie count after each 
                        meal (i.e. "Meal - 910 calories"). ONLY INCLUDE THE MEAL PLAN ITSELF, NO EXTRA COMMENTARY. ALL MEAL PLANS START WITH TITLE "### X-Day Meal Plan", then proceed to list
                        the days in format "### Day X" header, down one line, bullet "**Breakfast:** Meal - Calories", same for lunch and dinner, repeat for the other days.`;
    
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o-2024-05-13",
        });
    
        const markdownContent = completion.choices[0].message.content;
        //const htmlContent = marked.parse(markdownContent);
    
        res.send(markdownContent);
    
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));