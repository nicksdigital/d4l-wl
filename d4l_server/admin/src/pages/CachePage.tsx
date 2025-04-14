import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';
import api from '../api/api';
import LoadingScreen from '../components/common/LoadingScreen';

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
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
  
  &.danger {
    background: linear-gradient(to right, #EF4444, #F87171);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CacheCard = styled.div`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableContainer = styled.div`
  overflow-x: auto;
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
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const SuccessMessage = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.375rem;
  color: #10B981;
  margin-bottom: 1.5rem;
`;

export default function CachePage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery<{ success: boolean; data: string[] }>('cacheKeys', 
    () => api.get('/api/admin/cache/keys').then(res => res.data)
  );
  
  const deleteCacheKey = useMutation(
    (key: string) => api.delete(`/api/admin/cache/keys/${key}`).then(res => res.data),
    {
      onSuccess: () => {
        setSuccessMessage('Cache key deleted successfully');
        queryClient.invalidateQueries('cacheKeys');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      },
    }
  );
  
  const flushCache = useMutation(
    () => api.delete('/api/admin/cache/flush').then(res => res.data),
    {
      onSuccess: () => {
        setSuccessMessage('Cache flushed successfully');
        queryClient.invalidateQueries('cacheKeys');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      },
    }
  );
  
  if (isLoading) return <LoadingScreen />;
  
  if (error || !data?.success) {
    return (
      <div>
        <PageTitle>Cache Management</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading cache data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const cacheKeys = data.data;
  
  return (
    <div>
      <PageTitle>Cache Management</PageTitle>
      
      {successMessage && (
        <SuccessMessage>{successMessage}</SuccessMessage>
      )}
      
      <ActionBar>
        <Button 
          className="danger" 
          onClick={() => flushCache.mutate()} 
          disabled={flushCache.isLoading}
        >
          <FiTrash2 />
          {flushCache.isLoading ? 'Flushing...' : 'Flush All Cache'}
        </Button>
      </ActionBar>
      
      <CacheCard>
        <SectionTitle>Cache Keys</SectionTitle>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Key</TableHeader>
                <TableHeader style={{ width: '100px' }}>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {cacheKeys.map((key) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <ActionButton 
                      onClick={() => deleteCacheKey.mutate(key)} 
                      disabled={deleteCacheKey.isLoading}
                      title="Delete Cache Key"
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
              {cacheKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                    No cache keys found.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </CacheCard>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          onClick={() => queryClient.invalidateQueries('cacheKeys')} 
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          <FiRefreshCw />
          Refresh
        </Button>
      </div>
    </div>
  );
}
