import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiUsers, FiGift, FiFileText, FiSettings, FiDatabase, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const SidebarContainer = styled.aside`
  width: 250px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    &.open {
      left: 0;
    }
  }
`;

const Logo = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavMenu = styled.nav`
  padding: 1.5rem 1rem;
  flex: 1;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
    color: white;
    border-left: 3px solid #3B82F6;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`;

const UserSection = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  margin-right: 0.75rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
  color: white;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome /> },
    { path: '/users', label: 'Users', icon: <FiUsers /> },
    { path: '/airdrop', label: 'Airdrop', icon: <FiGift /> },
    { path: '/content', label: 'Content', icon: <FiFileText /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> },
    { path: '/cache', label: 'Cache', icon: <FiDatabase /> },
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoText>D4L Admin</LogoText>
      </Logo>

      <NavMenu>
        {navItems.map((item) => (
          <NavItem key={item.path} to={item.path} end={item.path === '/'}>
            {item.icon}
            <span>{item.label}</span>
          </NavItem>
        ))}
      </NavMenu>

      <UserSection>
        <UserAvatar>
          {user?.wallet.substring(0, 2)}
        </UserAvatar>
        <UserInfo>
          <UserName>{user?.wallet.substring(0, 6)}...{user?.wallet.substring(user.wallet.length - 4)}</UserName>
          <UserRole>Administrator</UserRole>
        </UserInfo>
        <LogoutButton onClick={logout}>
          <FiSettings />
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
}
