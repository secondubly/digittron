import { Box, Container, Text, Title } from '@mantine/core'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SpotifyQueue from '../components/spotifyqueue/SpotifyQueue';

const SongRequests: React.FC = () => {
  const { isAuthenticated } = useAuth()
  return (
    <Container fluid>
      <Box id="heading">
          <Title>Song Requests</Title>
          <Text>{isAuthenticated ? 'Manage' : 'View'} Song Requests</Text>
      </Box>

      <SpotifyQueue />
    </Container>
  );
};

export default SongRequests