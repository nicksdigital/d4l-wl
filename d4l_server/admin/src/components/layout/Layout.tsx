import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

export default function Layout() {
  return (
    <LayoutContainer>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <MainContent>
          <ContentWrapper>
            <Outlet />
          </ContentWrapper>
        </MainContent>
      </div>
    </LayoutContainer>
  );
}
