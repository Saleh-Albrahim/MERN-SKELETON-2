import React from 'react';
import { ChakraProvider, Flex, theme, Text } from '@chakra-ui/react';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Flex alignItems="center" justifyContent="center" height="100vh">
        <Text>hEY</Text>
      </Flex>
    </ChakraProvider>
  );
};

export default App;
