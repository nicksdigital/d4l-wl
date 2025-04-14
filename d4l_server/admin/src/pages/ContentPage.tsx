import { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
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
  justify-content: space-between;
  align-items: center;
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
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ContentCard = styled.div`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const ContentHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const ContentSlug = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ContentBody = styled.div`
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  max-height: 100px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, rgba(30, 41, 59, 0), rgba(30, 41, 59, 0.7));
  }
`;

const ContentFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContentMeta = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ContentActions = styled.div`
  display: flex;
  gap: 0.5rem;
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
  
  &.view:hover {
    color: #10B981;
  }
`;

const StatusBadge = styled.span<{ status: 'published' | 'draft' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
  color: ${props => props.status === 'published' ? '#10B981' : '#6B7280'};
  border: 1px solid ${props => props.status === 'published' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'};
  margin-left: 0.5rem;
`;

interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastModified: string;
  status: 'published' | 'draft';
}

export default function ContentPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data, isLoading, error } = useQuery<{ success: boolean; data: Content[] }>('content', 
    () => api.get('/api/admin/content').then(res => res.data)
  );
  
  if (isLoading) return <LoadingScreen />;
  
  if (error || !data?.success) {
    return (
      <div>
        <PageTitle>Content Management</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading content. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const content = data.data;
  
  return (
    <div>
      <PageTitle>Content Management</PageTitle>
      
      <ActionBar>
        <Button onClick={() => setShowAddModal(true)}>
          <FiPlus />
          Add New Content
        </Button>
      </ActionBar>
      
      <ContentGrid>
        {content.map((item) => (
          <ContentCard key={item.id}>
            <ContentHeader>
              <ContentTitle>
                {item.title}
                <StatusBadge status={item.status}>
                  {item.status}
                </StatusBadge>
              </ContentTitle>
              <ContentSlug>/{item.slug}</ContentSlug>
            </ContentHeader>
            
            <ContentBody>
              {item.content}
            </ContentBody>
            
            <ContentFooter>
              <ContentMeta>
                Last modified: {new Date(item.lastModified).toLocaleDateString()}
              </ContentMeta>
              
              <ContentActions>
                <ActionButton className="view" title="View Content">
                  <FiEye />
                </ActionButton>
                <ActionButton className="edit" title="Edit Content">
                  <FiEdit />
                </ActionButton>
                <ActionButton className="delete" title="Delete Content">
                  <FiTrash2 />
                </ActionButton>
              </ContentActions>
            </ContentFooter>
          </ContentCard>
        ))}
        
        {content.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
            <p>No content found. Click "Add New Content" to create your first content.</p>
          </div>
        )}
      </ContentGrid>
      
      {/* Add Content Modal would go here */}
    </div>
  );
}
