import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Chat from './components/Chat';

function App() {
  return (
    <Box p={4}>
      <Heading mb={8} textAlign="center">Chatbot con POL</Heading>
      <Chat />
    </Box>
  );
}

export default App;
