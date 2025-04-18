import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider from window.ethereum
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Create ethers provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get network
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          
          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setSigner(await provider.getSigner());
          }
        } catch (error) {
          console.error('Error initializing web3:', error);
          setError(error);
        }
      }
    };
    
    initProvider();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setSigner(null);
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          if (provider) {
            setSigner(await provider.getSigner());
          }
        }
      };
      
      const handleChainChanged = (chainIdHex) => {
        // Chain changed, reload the page
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, provider]);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsConnecting(true);
      setError(null);
      
      try {
        // Request accounts
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Update state
        setAccount(accounts[0]);
        
        // Get signer
        if (provider) {
          setSigner(await provider.getSigner());
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError(error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      setError(new Error('No Ethereum wallet found. Please install MetaMask.'));
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  // Switch network function
  const switchNetwork = async (chainId) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          // Add the network
          // This would need network-specific parameters
        }
        console.error('Error switching network:', error);
        setError(error);
      }
    }
  };

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;
