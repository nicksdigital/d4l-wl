import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiUsers, FiGift, FiDollarSign, FiPercent } from 'react-icons/fi';
import api from '../api/api';
import LoadingScreen from '../components/common/LoadingScreen';

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  background: ${props => `rgba(${props.color}, 0.2)`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    color: ${props => `rgb(${props.color})`};
    font-size: 1.5rem;
  }
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

interface DashboardStats {
  totalRegistered: number;
  totalMinted: number;
  totalClaimed: number;
  totalRewards: number;
  totalUsers: number;
  conversionRate: string;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: DashboardStats }>('dashboardStats', 
    () => api.get('/api/admin/dashboard/stats').then(res => res.data)
  );
  
  if (isLoading) return <LoadingScreen />;
  
  if (error || !data?.success) {
    return (
      <div>
        <PageTitle>Dashboard</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const stats = data.data;
  
  return (
    <div>
      <PageTitle>Dashboard</PageTitle>
      
      <StatsGrid>
        <StatCard>
          <StatIcon color="59, 130, 246">
            <FiUsers />
          </StatIcon>
          <StatTitle>Total Users</StatTitle>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatIcon color="139, 92, 246">
            <FiGift />
          </StatIcon>
          <StatTitle>Total Claimed</StatTitle>
          <StatValue>{stats.totalClaimed.toLocaleString()}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatIcon color="16, 185, 129">
            <FiDollarSign />
          </StatIcon>
          <StatTitle>Total Rewards</StatTitle>
          <StatValue>{stats.totalRewards.toLocaleString()}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatIcon color="245, 158, 11">
            <FiPercent />
          </StatIcon>
          <StatTitle>Conversion Rate</StatTitle>
          <StatValue>{stats.conversionRate}</StatValue>
        </StatCard>
      </StatsGrid>
      
      {/* Additional dashboard content can be added here */}
    </div>
  );
}
