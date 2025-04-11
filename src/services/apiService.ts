import { useSecureApi } from '@/hooks/useSecureApi';

export function useContractApi() {
  const api = useSecureApi();

  return {
    // User registration and profile
    getUserRegistrationStatus: (address: string) => 
      api.get(`/contract/registration/status/${address}`),
    
    getUserRegistrationDetails: (address: string) => 
      api.get(`/contract/registration/details/${address}`),
    
    registerUser: (email: string, social: string) => 
      api.post('/contract/registration/register', { email, social }),
    
    // Profile
    getUserProfile: (address: string) => 
      api.get(`/contract/profile/${address}`),
    
    getUserProfileId: (address: string) => 
      api.get(`/contract/profile/id/${address}`),
    
    // Airdrop
    getAirdropInfo: (profileId: string) => 
      api.get(`/contract/airdrop/info/${profileId}`),
    
    getAirdropStatus: () => 
      api.get('/contract/airdrop/status'),
    
    claimAirdrop: (signature: string) => 
      api.post('/contract/airdrop/claim', { signature }),
    
    // Token
    getTokenBalance: (address: string) => 
      api.get(`/contract/token/balance/${address}`),
    
    // Social
    getSocialConnections: (address: string) => 
      api.get(`/contract/social/connections/${address}`),
    
    // Rewards
    getUserRewards: (address: string) => 
      api.get(`/contract/rewards/${address}`),
    
    // Transactions
    getTransactionHistory: (address: string) => 
      api.get(`/contract/transactions/${address}`),
    
    // Gasless transactions
    executeGaslessTransaction: (functionName: string, args: any[]) =>
      api.post('/contract/gasless', { functionName, args })
  };
}
