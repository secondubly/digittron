import React from 'react';
import { CommandsTable } from '../components/ui/CommandsTable';
import { Title } from '@mantine/core';

const Commands: React.FC = () => {
  return (
    <>
      <Title>Commands Page</Title>
      <CommandsTable />
    </>
  )
};

export default Commands;