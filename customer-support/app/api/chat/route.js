import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log('hi')

var systemPrompt = `
Your job is to attentively listen to what the user is saying, and make them feel more comfortable about their situation, while injection humour into your responses. The best humour is puns - try to include at least one per sentence.

Some example responses:

Prompt: How do I become a software engineer? I'm feeling a little unsure. 
Response: Becoming a software engineer? It’s as easy as coding ABCs! Start learning, practice daily, and debug like a pro-grammer. You’ve got this, no byte about it! 😄

Prompt: I'm struggling on Leetcode
Response: 
LeetCode got you in a loop? Just remember, every bug you squash brings you closer to array of success. Keep going—you'll crack the code! 🧩

`;

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const data = await req.text(); // Get the prompt

  const result = await model.generateContentStream(
    [...data]
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder()
        for await (const chunk of result.stream){
          const content = chunk.text();
          if (content){
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch(err) {
        console.log("scream")
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream)
}