import { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { 
  FiUsers, 
  FiActivity, 
  FiClock, 
  FiZap, 
  FiBarChart2, 
  FiPieChart,
  FiCalendar,
  FiDownload
} from 'react-icons/fi';
import api from '../api/api';
import LoadingScreen from '../components/common/LoadingScreen';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const ChartContainer = styled.div`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#3B82F6' : 'transparent'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const PeriodSelector = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
`;

const PeriodButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#3B82F6' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.active ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
  
  &:hover {
    color: ${props => props.active ? '#3B82F6' : 'white'};
    background: ${props => props.active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
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

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

// Analytics dashboard stats interface
interface AnalyticsDashboardStats {
  activeUsers: number;
  newUsers: number;
  totalSessions: number;
  totalTransactions: number;
  totalGasUsed: string;
  topContracts: Array<{
    address: string;
    name?: string;
    interactions: number;
  }>;
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
  recentEvents: Array<{
    eventType: string;
    timestamp: number;
    walletAddress?: string;
  }>;
}

// Daily snapshot interface
interface DailySnapshot {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalTransactions: number;
  totalGasUsed: string;
  topContracts: Array<{
    address: string;
    interactions: number;
  }>;
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
}

// Contract interface
interface Contract {
  address: string;
  name?: string;
  type?: string;
  totalInteractions: number;
  uniqueUsers: number;
  lastInteraction: number;
  gasUsed: string;
  events: Record<string, number>;
}

// COLORS for charts
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#14B8A6'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'users'>('overview');
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('day');
  
  // Fetch analytics dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery<{ success: boolean; data: AnalyticsDashboardStats }>(
    ['analyticsDashboardStats', period],
    () => api.get(`/api/admin/analytics/dashboard/stats?period=${period}`).then(res => res.data),
    { refetchInterval: 60000 } // Refetch every minute
  );
  
  // Fetch daily snapshots for the last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery<{ success: boolean; data: DailySnapshot[] }>(
    'analyticsSnapshots',
    () => api.get(`/api/admin/analytics/snapshots/daily?startDate=${formatDate(sevenDaysAgo)}&endDate=${formatDate(today)}`).then(res => res.data)
  );
  
  // Fetch all contracts
  const { data: contractsData, isLoading: contractsLoading } = useQuery<{ success: boolean; data: Contract[] }>(
    'analyticsContracts',
    () => api.get('/api/admin/analytics/contracts').then(res => res.data)
  );
  
  if (statsLoading || snapshotsLoading || contractsLoading) {
    return <LoadingScreen />;
  }
  
  if (!statsData?.success || !snapshotsData?.success || !contractsData?.success) {
    return (
      <div>
        <PageTitle>Analytics</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const stats = statsData.data;
  const snapshots = snapshotsData.data;
  const contracts = contractsData.data;
  
  // Format gas used
  const formatGas = (gas: string) => {
    const gasNumber = parseFloat(gas);
    if (gasNumber >= 1e9) {
      return `${(gasNumber / 1e9).toFixed(2)} Gwei`;
    } else if (gasNumber >= 1e6) {
      return `${(gasNumber / 1e6).toFixed(2)} Mwei`;
    } else {
      return `${gasNumber.toLocaleString()} wei`;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Format event type
  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // Prepare chart data
  const userChartData = snapshots.map(snapshot => ({
    date: snapshot.date,
    activeUsers: snapshot.activeUsers,
    newUsers: snapshot.newUsers
  }));
  
  const transactionChartData = snapshots.map(snapshot => ({
    date: snapshot.date,
    transactions: snapshot.totalTransactions
  }));
  
  const topContractsChartData = stats.topContracts.map(contract => ({
    name: contract.name || contract.address.substring(0, 6) + '...' + contract.address.substring(contract.address.length - 4),
    value: contract.interactions
  }));
  
  const topEventsChartData = stats.topEvents.map(event => ({
    name: formatEventType(event.eventType),
    value: event.count
  }));
  
  return (
    <div>
      <PageTitle>Analytics</PageTitle>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab 
          active={activeTab === 'contracts'} 
          onClick={() => setActiveTab('contracts')}
        >
          Contracts
        </Tab>
        <Tab 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </Tab>
      </TabContainer>
      
      {activeTab === 'overview' && (
        <>
          <PeriodSelector>
            <PeriodButton 
              active={period === 'day'} 
              onClick={() => setPeriod('day')}
            >
              Day
            </PeriodButton>
            <PeriodButton 
              active={period === 'week'} 
              onClick={() => setPeriod('week')}
            >
              Week
            </PeriodButton>
            <PeriodButton 
              active={period === 'month'} 
              onClick={() => setPeriod('month')}
            >
              Month
            </PeriodButton>
            <PeriodButton 
              active={period === 'all'} 
              onClick={() => setPeriod('all')}
            >
              All Time
            </PeriodButton>
          </PeriodSelector>
          
          <StatsGrid>
            <StatCard>
              <StatIcon color="59, 130, 246">
                <FiUsers />
              </StatIcon>
              <StatTitle>Active Users</StatTitle>
              <StatValue>{stats.activeUsers.toLocaleString()}</StatValue>
            </StatCard>
            
            <StatCard>
              <StatIcon color="139, 92, 246">
                <FiActivity />
              </StatIcon>
              <StatTitle>New Users</StatTitle>
              <StatValue>{stats.newUsers.toLocaleString()}</StatValue>
            </StatCard>
            
            <StatCard>
              <StatIcon color="16, 185, 129">
                <FiZap />
              </StatIcon>
              <StatTitle>Total Transactions</StatTitle>
              <StatValue>{stats.totalTransactions.toLocaleString()}</StatValue>
            </StatCard>
            
            <StatCard>
              <StatIcon color="245, 158, 11">
                <FiClock />
              </StatIcon>
              <StatTitle>Total Gas Used</StatTitle>
              <StatValue>{formatGas(stats.totalGasUsed)}</StatValue>
            </StatCard>
          </StatsGrid>
          
          <ChartGrid>
            <ChartContainer>
              <ChartTitle>User Activity</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" strokeWidth={2} name="Active Users" />
                  <Line type="monotone" dataKey="newUsers" stroke="#8B5CF6" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer>
              <ChartTitle>Transactions</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="transactions" fill="#10B981" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer>
              <ChartTitle>Top Contracts</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topContractsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topContractsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer>
              <ChartTitle>Top Events</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topEventsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topEventsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartGrid>
          
          <ChartContainer>
            <ChartTitle>Recent Events</ChartTitle>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event Type</TableHeader>
                    <TableHeader>Timestamp</TableHeader>
                    <TableHeader>Wallet</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {stats.recentEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatEventType(event.eventType)}</TableCell>
                      <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                      <TableCell>
                        {event.walletAddress ? (
                          `${event.walletAddress.substring(0, 6)}...${event.walletAddress.substring(event.walletAddress.length - 4)}`
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recentEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                        No recent events found.
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </ChartContainer>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ActionButton>
              <FiCalendar />
              Create Daily Snapshot
            </ActionButton>
            <ActionButton style={{ marginLeft: '0.5rem' }}>
              <FiDownload />
              Export Data
            </ActionButton>
          </div>
        </>
      )}
      
      {activeTab === 'contracts' && (
        <>
          <ChartContainer>
            <ChartTitle>Contract Analytics</ChartTitle>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Contract</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Interactions</TableHeader>
                    <TableHeader>Unique Users</TableHeader>
                    <TableHeader>Last Interaction</TableHeader>
                    <TableHeader>Gas Used</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.address}>
                      <TableCell>
                        {contract.name || `${contract.address.substring(0, 6)}...${contract.address.substring(contract.address.length - 4)}`}
                      </TableCell>
                      <TableCell>{contract.type || 'Unknown'}</TableCell>
                      <TableCell>{contract.totalInteractions.toLocaleString()}</TableCell>
                      <TableCell>{contract.uniqueUsers.toLocaleString()}</TableCell>
                      <TableCell>{formatTimestamp(contract.lastInteraction)}</TableCell>
                      <TableCell>{formatGas(contract.gasUsed)}</TableCell>
                    </TableRow>
                  ))}
                  {contracts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                        No contracts found.
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </ChartContainer>
          
          {contracts.length > 0 && (
            <ChartContainer>
              <ChartTitle>Top Contract Events</ChartTitle>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Contract</TableHeader>
                      <TableHeader>Event</TableHeader>
                      <TableHeader>Count</TableHeader>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {contracts.slice(0, 5).flatMap(contract => 
                      Object.entries(contract.events)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, 3)
                        .map(([eventName, count]) => (
                          <TableRow key={`${contract.address}-${eventName}`}>
                            <TableCell>
                              {contract.name || `${contract.address.substring(0, 6)}...${contract.address.substring(contract.address.length - 4)}`}
                            </TableCell>
                            <TableCell>{eventName}</TableCell>
                            <TableCell>{count.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </ChartContainer>
          )}
        </>
      )}
      
      {activeTab === 'users' && (
        <>
          <ChartContainer>
            <ChartTitle>User Activity Over Time</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" strokeWidth={2} name="Active Users" />
                <Line type="monotone" dataKey="newUsers" stroke="#8B5CF6" strokeWidth={2} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <ChartContainer>
            <ChartTitle>User Engagement</ChartTitle>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#3B82F6' }}>
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Active Users</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8B5CF6' }}>
                  {stats.newUsers.toLocaleString()}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>New Users</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10B981' }}>
                  {stats.totalSessions.toLocaleString()}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Sessions</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#F59E0B' }}>
                  {stats.totalTransactions.toLocaleString()}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Transactions</div>
              </div>
            </div>
          </ChartContainer>
        </>
      )}
    </div>
  );
}
