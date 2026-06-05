import React from 'react';
import { CommandsTable } from '../components/ui/CommandsTable';
import { Box, Title, Text, Stack } from '@mantine/core';

const Commands: React.FC = () => {
  return (
    <Stack p={{xs: 0, md: 'xl'}}>
      <Box id="heading">
          <Title>Commands</Title>
          <Text>Commands are used to trigger responses in chat</Text>
      </Box>
      <Box id="command-table">
        <CommandsTable />
      </Box>
    </Stack>
  )
};

export default Commands;