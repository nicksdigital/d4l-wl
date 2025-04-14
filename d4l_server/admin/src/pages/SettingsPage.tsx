import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiSave } from 'react-icons/fi';
import api from '../api/api';
import LoadingScreen from '../components/common/LoadingScreen';

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
`;

const SettingsCard = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Textarea = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: white;
  transition: all 0.3s ease;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 0.5rem;
  }
`;

const ErrorText = styled.div`
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

interface Settings {
  siteTitle: string;
  siteDescription: string;
  airdropEnabled: boolean;
  maintenanceMode: boolean;
}

// Validation schema
const SettingsSchema = Yup.object().shape({
  siteTitle: Yup.string().required('Site title is required'),
  siteDescription: Yup.string().required('Site description is required'),
  airdropEnabled: Yup.boolean(),
  maintenanceMode: Yup.boolean(),
});

export default function SettingsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery<{ success: boolean; data: Settings }>('settings', 
    () => api.get('/api/admin/settings').then(res => res.data)
  );
  
  const updateSettings = useMutation(
    (values: Settings) => api.put('/api/admin/settings', values).then(res => res.data),
    {
      onSuccess: () => {
        setSuccessMessage('Settings updated successfully');
        queryClient.invalidateQueries('settings');
        
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
        <PageTitle>Settings</PageTitle>
        <div className="glass-card">
          <p className="text-danger">Error loading settings. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const settings = data.data;
  
  return (
    <div>
      <PageTitle>Settings</PageTitle>
      
      {successMessage && (
        <SuccessMessage>{successMessage}</SuccessMessage>
      )}
      
      <Formik
        initialValues={settings}
        validationSchema={SettingsSchema}
        onSubmit={(values, { setSubmitting }) => {
          updateSettings.mutate(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <SettingsCard>
              <SectionTitle>General Settings</SectionTitle>
              
              <FormGroup>
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input type="text" id="siteTitle" name="siteTitle" />
                <ErrorMessage name="siteTitle" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea as="textarea" id="siteDescription" name="siteDescription" />
                <ErrorMessage name="siteDescription" component={ErrorText} />
              </FormGroup>
            </SettingsCard>
            
            <SettingsCard>
              <SectionTitle>Feature Settings</SectionTitle>
              
              <FormGroup>
                <Checkbox>
                  <Field type="checkbox" id="airdropEnabled" name="airdropEnabled" />
                  <Label htmlFor="airdropEnabled" style={{ marginBottom: 0 }}>Enable Airdrop</Label>
                </Checkbox>
              </FormGroup>
              
              <FormGroup>
                <Checkbox>
                  <Field type="checkbox" id="maintenanceMode" name="maintenanceMode" />
                  <Label htmlFor="maintenanceMode" style={{ marginBottom: 0 }}>Maintenance Mode</Label>
                </Checkbox>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                  When enabled, the site will display a maintenance message to all users.
                </div>
              </FormGroup>
            </SettingsCard>
            
            <SubmitButton type="submit" disabled={isSubmitting || updateSettings.isLoading}>
              <FiSave />
              {isSubmitting || updateSettings.isLoading ? 'Saving...' : 'Save Settings'}
            </SubmitButton>
          </Form>
        )}
      </Formik>
    </div>
  );
}
