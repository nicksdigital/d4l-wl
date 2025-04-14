import { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiGift, FiPlus, FiDownload } from 'react-icons/fi';
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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: rgba(15, 23, 42, 0.5);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
`;

const TableCell = styled.td`
  padding: 1rem;
  color: white;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'completed' | 'failed' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(16, 185, 129, 0.2)';
      case 'pending': return 'rgba(245, 158, 11, 0.2)';
      case 'failed': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(16, 185, 129, 0.3)';
      case 'pending': return 'rgba(245, 158, 11, 0.3)';
      case 'failed': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(107, 114, 128, 0.3)';
    }
  }};
`;

interface AirdropStats {
  totalAllocated: number;
  totalClaimed: number;
  claimRate: string;
  uniqueClaimers: number;
}

interface Claim {
  id: string;
  wallet: string;
  amount: number;
  timestamp: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
}

export default function AirdropPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: statsData, isLoading: statsLoading } = useQuery<{ success: boolean; data: AirdropStats }>('airdropStats', 
    () => api.get('/api/admin/airdrop/stats').then(res => res.data)
  );
  
  const { data: claimsData, isLoading: claimsLoading } = useQuery<{ success: boolean; data: Claim[] }>('airdropClaims', 
    () => api.get('/api/admin/airdrop/claims').then(res => res.data)
  );
  
  if (statsLoading || claimsLoading) return <LoadingScreen />;
  
  if (!statsData?.success || !claimsData?.success) {
    return (
      <div>
        <PageTitle>Airdrop Management</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading airdrop data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const stats = statsData.data;
  const claims = claimsData.data;
  
  return (
    <div>
      <PageTitle>Airdrop Management</PageTitle>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Allocated</StatTitle>
          <StatValue>{stats.totalAllocated.toLocaleString()} D4L</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Total Claimed</StatTitle>
          <StatValue>{stats.totalClaimed.toLocaleString()} D4L</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Claim Rate</StatTitle>
          <StatValue>{stats.claimRate}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Unique Claimers</StatTitle>
          <StatValue>{stats.uniqueClaimers.toLocaleString()}</StatValue>
        </StatCard>
      </StatsGrid>
      
      <ActionBar>
        <div>
          <Button onClick={() => setShowAddModal(true)}>
            <FiPlus />
            Add Allocation
          </Button>
        </div>
        
        <Button className="secondary">
          <FiDownload />
          Export CSV
        </Button>
      </ActionBar>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Wallet</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Transaction</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>{claim.wallet.substring(0, 6)}...{claim.wallet.substring(claim.wallet.length - 4)}</TableCell>
                <TableCell>{claim.amount.toLocaleString()} D4L</TableCell>
                <TableCell>{new Date(claim.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  {claim.txHash ? (
                    <a 
                      href={`https://basescan.org/tx/${claim.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#3B82F6', textDecoration: 'none' }}
                    >
                      {claim.txHash.substring(0, 6)}...{claim.txHash.substring(claim.txHash.length - 4)}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={claim.status}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
            {claims.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                  No claims found.
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </TableContainer>
      
      {/* Add Allocation Modal would go here */}
    </div>
  );
}
