import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
Welcome to Headstarter Support! I'm here to assist you with any questions or issues you might have about our AI interview platform. Whether you need help navigating our features, have questions about your account, or want tips on getting the most out of your interview preparation, I'm here to help.

How can I assist you today?
Getting Started:

How do I create an account?
What are the first steps to start practicing interviews?

Platform Features:
How does the real-time interview simulation work?
What types of interview questions can I practice?

Technical Support:
I'm having trouble accessing the platform. Can you help?
What should I do if I encounter an error during an interview session?
Account Management:

How do I update my account information?
What are the subscription options available?
Interview Preparation Tips:

How can I improve my interview skills using Headstarter?
Are there any resources for specific industries or roles?
Feel free to ask any other questions, and I'll do my best to provide the support you need. Let's get you started on your path to interview success!
`;

export async function POST(req) {
  const APIKEY = process.env.GEMINI_API_KEY;
  console.log(APIKEY)

  const genAI = new GoogleGenerativeAI({ apiKey: APIKEY });
  const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const { prompt } = await req.json(); // Get the prompt

  try {
    const completion = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 150, 
      },
    });

    return NextResponse.json(
      { message: completion.response.text() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Error generating content' }, { status: 500 });
  }
}