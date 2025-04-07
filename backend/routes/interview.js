const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate MCQ question
router.post('/mcq', async (req, res) => {
  try {
    const { topic } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a technical MCQ question about ${topic} in the following JSON format:
    {
      "type": "MCQ",
      "question": "detailed question here",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": "correct option here",
      "explanation": "detailed explanation here",
      "topic": "${topic}"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const question = JSON.parse(text);
    
    res.json(question);
  } catch (error) {
    console.error('Error generating MCQ:', error);
    res.status(500).json({ error: 'Failed to generate MCQ' });
  }
});

// Generate interview question
router.post('/question', async (req, res) => {
  try {
    const { topic } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a technical interview question about ${topic} in the following JSON format:
    {
      "question": "detailed question here",
      "expected_points": ["point1", "point2", "point3"],
      "difficulty": "easy/medium/hard",
      "reference": "reference material or documentation",
      "topic_area": "${topic}"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const question = JSON.parse(text);
    
    res.json(question);
  } catch (error) {
    console.error('Error generating interview question:', error);
    res.status(500).json({ error: 'Failed to generate interview question' });
  }
});

// Evaluate MCQ answer
router.post('/evaluate-mcq', async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Evaluate this MCQ answer:
    Question ID: ${questionId}
    Answer: ${answer}
    
    Respond in JSON format:
    {
      "correct": true/false,
      "explanation": "detailed explanation here"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const evaluation = JSON.parse(text);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating MCQ:', error);
    res.status(500).json({ error: 'Failed to evaluate MCQ' });
  }
});

// Evaluate interview response
router.post('/evaluate-response', async (req, res) => {
  try {
    const { question, response } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Evaluate this technical interview response:
    Question: ${question.question}
    Expected Points: ${question.expected_points.join(', ')}
    Candidate's Response: ${response}
    
    Respond in JSON format:
    {
      "score": "score out of 100",
      "feedback": "detailed feedback here",
      "key_points_covered": ["point1", "point2"],
      "missing_concepts": ["concept1", "concept2"],
      "improvement_suggestions": ["suggestion1", "suggestion2"]
    }`;

    const result = await model.generateContent(prompt);
    const response_text = await result.response;
    const text = response_text.text();
    const evaluation = JSON.parse(text);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating response:', error);
    res.status(500).json({ error: 'Failed to evaluate response' });
  }
});

module.exports = router; 