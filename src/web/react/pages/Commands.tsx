import React from 'react';
import { CommandsTable } from '../components/ui/CommandsTable';
import { Box, Title, Text } from '@mantine/core';

const Commands: React.FC = () => {
  return (
    <>
      <Box id="heading">
          <Title>Commands</Title>
          <Text>Commands are used to trigger responses in chat</Text>
      </Box>
      <CommandsTable />
    </>
  )
};

export default Commands;