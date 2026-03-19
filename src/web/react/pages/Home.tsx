import React from 'react';
import { useForm } from '@mantine/form'
import LoginForm from '../components/ui/LoginForm';

const Home: React.FC = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: 'fake@mail.com',
      password: 'password'
    }
  })

  return (
    <> 
    </>
  );


};

export default Home;