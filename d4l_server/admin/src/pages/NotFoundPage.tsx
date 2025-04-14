import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Icon = styled.div`
  font-size: 4rem;
  color: #EF4444;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  max-width: 500px;
`;

const HomeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

export default function NotFoundPage() {
  return (
    <NotFoundContainer>
      <Icon>
        <FiAlertTriangle />
      </Icon>
      <Title>404 - Page Not Found</Title>
      <Message>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Message>
      <HomeButton to="/">
        Return to Dashboard
      </HomeButton>
    </NotFoundContainer>
  );
}
