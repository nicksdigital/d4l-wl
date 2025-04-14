import { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiSearch, FiEdit, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';
import api from '../api/api';
import LoadingScreen from '../components/common/LoadingScreen';

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(30, 41, 59, 0.7);
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

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.active ? '#10B981' : '#EF4444'};
  border: 1px solid ${props => props.active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
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
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.edit:hover {
    color: #3B82F6;
  }
  
  &.delete:hover {
    color: #EF4444;
  }
  
  &.deactivate:hover {
    color: #F59E0B;
  }
  
  &.activate:hover {
    color: #10B981;
  }
`;

interface User {
  wallet: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useQuery<{ success: boolean; data: User[] }>('users', 
    () => api.get('/api/admin/users').then(res => res.data)
  );
  
  if (isLoading) return <LoadingScreen />;
  
  if (error || !data?.success) {
    return (
      <div>
        <PageTitle>Users</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading users. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  // Filter users based on search term
  const filteredUsers = data.data.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.wallet.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <PageTitle>Users</PageTitle>
      
      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput 
          type="text" 
          placeholder="Search users by username, email, or wallet..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Username</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Wallet</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created At</TableHeader>
              <TableHeader>Last Login</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredUsers.map((user) => (
              <TableRow key={user.wallet}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.wallet.substring(0, 6)}...{user.wallet.substring(user.wallet.length - 4)}</TableCell>
                <TableCell>
                  <StatusBadge active={user.isActive}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionButton className="edit" title="Edit User">
                      <FiEdit />
                    </ActionButton>
                    {user.isActive ? (
                      <ActionButton className="deactivate" title="Deactivate User">
                        <FiUserX />
                      </ActionButton>
                    ) : (
                      <ActionButton className="activate" title="Activate User">
                        <FiUserCheck />
                      </ActionButton>
                    )}
                    <ActionButton className="delete" title="Delete User">
                      <FiTrash2 />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center' }}>
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}
