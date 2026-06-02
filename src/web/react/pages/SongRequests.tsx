import { Box, Container, Text, Title } from '@mantine/core'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SpotifyQueue from '../components/spotifyqueue/SpotifyQueue';
import { useSpotifyAuth } from '../lib/spotify'


const SongRequests: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const { token } = useSpotifyAuth()
  return (
    <Container>
      <Box id="heading">
          <Title>Song Requests</Title>
          <Text>{isAuthenticated ? 'Manage' : 'View'} Song Requests</Text>
      </Box>

      <SpotifyQueue accessToken={token}/>
    </Container>
  );
};

export default SongRequests