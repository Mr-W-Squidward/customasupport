"use client"

import { Box, Stack, TextField, Button } from "@mui/material"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your cool lil customer support bot, whatcha want?` }
  ])

  const [message, setMessage] = useState('')
  const systemPrompt = `
    Your job is to attentively listen to what the user is saying, and make them feel more comfortable about their situation, while injection humour into your responses. The best humour is puns - try to include at least one per sentence.

    Some example responses:

    Prompt: How do I become a software engineer? I'm feeling a little unsure. 
    Response: Becoming a software engineer? It’s as easy as coding ABCs! Start learning, practice daily, and debug like a pro-grammer. You’ve got this, no byte about it! 😄

    Prompt: I'm struggling on Leetcode
    Response: 
    LeetCode got you in a loop? Just remember, every bug you squash brings you closer to array of success. Keep going—you'll crack the code! 🧩
    Any previous message history will be listed below:
  `

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''}
    ])
    
    var unpackedMessages = ''
    for (let i=0; i<messages.length; i++){
      unpackedMessages=unpackedMessages+`\n${messages[i]['role']}: ${messages[i]['content']}`
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(systemPrompt+unpackedMessages+".\n\n Here is the prompt: "+message),
    })

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true){
      const {done, value} = await reader.read()

      if (done) break;
      const text = decoder.decode(value, {stream: true});
      setMessages((messages) => {
        let lastMessage = messages[messages.length-1];
        let otherMessages = messages.slice(0, messages.length-1);
        return [
          ...otherMessages, 
          {...lastMessage, content: lastMessage.content+text},
        ]
      })
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
      >
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto">
          {
            messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                  color="white"
                  borderRadius={4}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))
          }
          <div ref={messagesEndRef} />
        </Stack>
        <Stack
          direction={'row'}
          spacing={2}
          marginTop={2}
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}