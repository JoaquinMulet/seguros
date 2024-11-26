import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Container,
  Flex,
  useToast,
  Icon,
  Avatar,
} from '@chakra-ui/react';
import { Select, chakraComponents } from 'chakra-react-select';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';

interface PolicyOption {
  value: string;
  label: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{sender: string; text: string}>>([]);
  const [input, setInput] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyOption | null>(null);
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const response = await fetch('/polizas.txt');
        if (!response.ok) {
          throw new Error('Error al cargar el archivo de pólizas');
        }
        const text = await response.text();
        const policyList = [
          {
            value: '*',  
            label: 'Todas las pólizas'
          },
          ...text.split('\n')
            .filter(line => line.trim() !== '')
            .map(policy => {
              const trimmedPolicy = policy.trim();
              return {
                value: '*', // Keeping '*' as the value for all policies
                label: trimmedPolicy
              };
            })
        ];
        setPolicies(policyList);
      } catch (error) {
        console.error('Error loading policies:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las pólizas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadPolicies();
  }, [toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPolicy) {
      toast({
        title: 'Error',
        description: 'Por favor seleccione una póliza y escriba un mensaje',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      console.log('Póliza seleccionada:', selectedPolicy);

      const requestData = {
        session_id: crypto.randomUUID(),
        POL: selectedPolicy?.value || '*',  
        message: input
      };
      
      console.log('Enviando datos a la API:', requestData);
      
      const response = await axios.post(
        'https://joaquinmulet.app.n8n.cloud/webhook/2d368f82-3c8a-4520-93ee-f5fcf241dc72',
        requestData
      );

      console.log('Respuesta de la API:', response.data);

      const botMessage = {
        sender: 'assistant',
        text: response.data.output || 'Sin respuesta del servidor'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error completo:', error);
      toast({
        title: 'Error',
        description: 'Error al enviar el mensaje',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" h="100vh" py={4}>
      <VStack spacing={4} h="full">
        <Box w="100%" maxW="container.md">
          <Select<PolicyOption>
            placeholder="Buscar o seleccionar póliza..."
            options={policies}
            value={selectedPolicy}
            onChange={(newValue) => setSelectedPolicy(newValue)}
            isClearable
            isSearchable
            chakraStyles={{
              container: (provided) => ({
                ...provided,
                bg: 'white',
                borderRadius: 'lg',
              }),
              control: (provided) => ({
                ...provided,
                borderColor: 'gray.300',
                _hover: {
                  borderColor: 'gray.400',
                },
              }),
              option: (provided, { data }) => ({
                ...provided,
                bg: data.value === '*' ? 'gray.50' : provided.bg,
                color: 'black',
                fontWeight: data.value === '*' ? 'bold' : 'normal',
              }),
            }}
          />
        </Box>

        <Box
          w="100%"
          flex="1"
          overflowY="auto"
          bg="gray.50"
          borderRadius="xl"
          p={4}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray',
              borderRadius: '24px',
            },
          }}
        >
          {messages.map((msg, idx) => (
            <Flex
              key={idx}
              justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
              mb={6}
              align="start"
            >
              {msg.sender === 'assistant' && (
                <Avatar
                  size="sm"
                  name="Assistant"
                  bg="purple.500"
                  color="white"
                  mr={2}
                />
              )}
              <Box
                maxW="70%"
                bg={msg.sender === 'user' ? 'purple.500' : 'white'}
                color={msg.sender === 'user' ? 'white' : 'black'}
                p={4}
                borderRadius="xl"
                boxShadow="sm"
                fontSize="md"
                whiteSpace="pre-wrap"
              >
                <Text>{msg.text}</Text>
              </Box>
              {msg.sender === 'user' && (
                <Avatar
                  size="sm"
                  name="User"
                  bg="gray.200"
                  ml={2}
                />
              )}
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '1024px' }}>
          <Flex>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              size="lg"
              bg="white"
              borderRadius="lg"
              mr={2}
              _focus={{
                borderColor: 'purple.500',
                boxShadow: '0 0 0 1px purple.500',
              }}
            />
            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              borderRadius="lg"
              px={8}
              isDisabled={!input.trim() || !selectedPolicy}
            >
              <Icon as={FiSend} />
            </Button>
          </Flex>
        </form>
      </VStack>
    </Container>
  );
};

export default Chat;
