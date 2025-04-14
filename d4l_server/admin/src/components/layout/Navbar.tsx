import { useState } from 'react';
import styled from 'styled-components';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const NavbarContainer = styled.header`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
  cursor: pointer;
  margin-right: 1rem;
  position: relative;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #EF4444;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  margin-right: 0.75rem;
`;

const UserName = styled.div`
  font-weight: 500;
  color: white;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export default function Navbar() {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(3);
  
  const toggleSidebar = () => {
    const sidebar = document.querySelector('aside');
    sidebar?.classList.toggle('open');
  };
  
  return (
    <NavbarContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FiMenu />
        </MenuButton>
        
        <SearchBar>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput placeholder="Search..." />
        </SearchBar>
      </LeftSection>
      
      <RightSection>
        <NotificationButton>
          <FiBell />
          {notificationCount > 0 && (
            <NotificationBadge>{notificationCount}</NotificationBadge>
          )}
        </NotificationButton>
        
        <UserInfo>
          <UserAvatar>
            {user?.wallet.substring(0, 2)}
          </UserAvatar>
          <UserName>
            {user?.wallet.substring(0, 6)}...{user?.wallet.substring(user.wallet.length - 4)}
          </UserName>
        </UserInfo>
      </RightSection>
    </NavbarContainer>
  );
}
