import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useCrossChain } from '../contexts/CrossChainContext';

export default function CrossChain() {
  const { account, connectWallet } = useWeb3();
  const { 
    chains, 
    activeChain, 
    soulIds, 
    switchToChain, 
    createSoulIdentity,
    routeReputationCrossChain,
    routeRewardsCrossChain,
    getReputationOnChain,
    getRewardsOnChain
  } = useCrossChain();
  
  const [balances, setBalances] = useState({
    chainA: { reputation: null, rewards: null },
    chainB: { reputation: null, rewards: null }
  });
  
  const [transferAmount, setTransferAmount] = useState('10');
  const [transferType, setTransferType] = useState('reputation');
  const [fromChain, setFromChain] = useState('chainA');
  const [toChain, setToChain] = useState('chainB');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [isCreatingSoul, setIsCreatingSoul] = useState(false);
  const [createSoulError, setCreateSoulError] = useState(null);

  // Fetch balances on both chains
  useEffect(() => {
    const fetchBalances = async () => {
      if (!account) return;
      
      try {
        const newBalances = { ...balances };
        
        // Fetch reputation and rewards on Chain A
        if (soulIds.chainA) {
          try {
            const reputationA = await getReputationOnChain('chainA');
            const rewardsA = await getRewardsOnChain('chainA');
            
            newBalances.chainA = {
              reputation: reputationA,
              rewards: rewardsA
            };
          } catch (e) {
            console.error('Error fetching Chain A balances:', e);
          }
        }
        
        // Fetch reputation and rewards on Chain B
        if (soulIds.chainB) {
          try {
            const reputationB = await getReputationOnChain('chainB');
            const rewardsB = await getRewardsOnChain('chainB');
            
            newBalances.chainB = {
              reputation: reputationB,
              rewards: rewardsB
            };
          } catch (e) {
            console.error('Error fetching Chain B balances:', e);
          }
        }
        
        setBalances(newBalances);
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };
    
    fetchBalances();
  }, [account, soulIds, getReputationOnChain, getRewardsOnChain]);

  // Handle creating a soul identity on the current chain
  const handleCreateSoulIdentity = async () => {
    if (!account || isCreatingSoul) return;
    
    setIsCreatingSoul(true);
    setCreateSoulError(null);
    
    try {
      await createSoulIdentity();
      // Refresh balances after creating soul
      setTimeout(() => {
        const fetchBalances = async () => {
          if (soulIds[activeChain]) {
            try {
              const reputation = await getReputationOnChain(activeChain);
              const rewards = await getRewardsOnChain(activeChain);
              
              setBalances(prev => ({
                ...prev,
                [activeChain]: {
                  reputation,
                  rewards
                }
              }));
            } catch (e) {
              console.error(`Error fetching ${activeChain} balances:`, e);
            }
          }
        };
        
        fetchBalances();
      }, 2000);
    } catch (error) {
      console.error('Error creating soul identity:', error);
      setCreateSoulError(error.message || 'Failed to create soul identity');
    } finally {
      setIsCreatingSoul(false);
    }
  };

  // Handle cross-chain transfer
  const handleCrossChainTransfer = async () => {
    if (!account || isTransferring) return;
    
    if (!soulIds[fromChain] || !soulIds[toChain]) {
      setTransferError('Soul identities not available on both chains');
      return;
    }
    
    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);
    
    try {
      const amount = ethers.parseEther(transferAmount);
      
      if (transferType === 'reputation') {
        await routeReputationCrossChain(fromChain, toChain, amount);
      } else {
        await routeRewardsCrossChain(fromChain, toChain, amount);
      }
      
      setTransferSuccess(`Successfully initiated ${transferType} transfer from ${chains[fromChain].name} to ${chains[toChain].name}`);
      
      // Refresh balances after transfer
      setTimeout(() => {
        const fetchBalances = async () => {
          try {
            const reputationFrom = await getReputationOnChain(fromChain);
            const rewardsFrom = await getRewardsOnChain(fromChain);
            
            setBalances(prev => ({
              ...prev,
              [fromChain]: {
                reputation: reputationFrom,
                rewards: rewardsFrom
              }
            }));
            
            // Note: The destination chain balance won't update immediately
            // as the cross-chain message needs time to be processed
          } catch (e) {
            console.error('Error refreshing balances:', e);
          }
        };
        
        fetchBalances();
      }, 2000);
    } catch (error) {
      console.error('Error transferring cross-chain:', error);
      setTransferError(error.message || 'Failed to transfer cross-chain');
    } finally {
      setIsTransferring(false);
    }
  };

  // Format balance display
  const formatBalance = (balance) => {
    if (balance === null) return 'N/A';
    return ethers.formatEther(balance);
  };

  if (!account) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Cross-Chain Testing</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to test cross-chain functionality.</p>
        <button 
          onClick={connectWallet} 
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Cross-Chain Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Chain A Card */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{chains.chainA.name}</h2>
            <button
              onClick={() => switchToChain('chainA')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeChain === 'chainA'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {activeChain === 'chainA' ? 'Connected' : 'Switch'}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Soul Identity</div>
            {soulIds.chainA ? (
              <div className="text-sm font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                {soulIds.chainA}
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-red-500 mr-2">Not created</span>
                {activeChain === 'chainA' && (
                  <button
                    onClick={handleCreateSoulIdentity}
                    disabled={isCreatingSoul}
                    className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    {isCreatingSoul ? 'Creating...' : 'Create'}
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Reputation</div>
              <div className="text-lg font-semibold">
                {formatBalance(balances.chainA.reputation)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Rewards</div>
              <div className="text-lg font-semibold">
                {formatBalance(balances.chainA.rewards)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chain B Card */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{chains.chainB.name}</h2>
            <button
              onClick={() => switchToChain('chainB')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeChain === 'chainB'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {activeChain === 'chainB' ? 'Connected' : 'Switch'}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Soul Identity</div>
            {soulIds.chainB ? (
              <div className="text-sm font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                {soulIds.chainB}
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-red-500 mr-2">Not created</span>
                {activeChain === 'chainB' && (
                  <button
                    onClick={handleCreateSoulIdentity}
                    disabled={isCreatingSoul}
                    className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    {isCreatingSoul ? 'Creating...' : 'Create'}
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Reputation</div>
              <div className="text-lg font-semibold">
                {formatBalance(balances.chainB.reputation)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Rewards</div>
              <div className="text-lg font-semibold">
                {formatBalance(balances.chainB.rewards)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {createSoulError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-md text-red-700">
          {createSoulError}
        </div>
      )}
      
      {/* Cross-Chain Transfer Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Cross-Chain Transfer</h2>
        
        {(!soulIds.chainA || !soulIds.chainB) ? (
          <div className="p-4 bg-yellow-100 border border-yellow-200 rounded-md text-yellow-700 mb-4">
            You need to create Soul Identities on both chains to perform cross-chain transfers.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Type
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="reputation">Reputation</option>
                  <option value="rewards">Rewards</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Chain
                </label>
                <select
                  value={fromChain}
                  onChange={(e) => {
                    setFromChain(e.target.value);
                    if (e.target.value === toChain) {
                      setToChain(e.target.value === 'chainA' ? 'chainB' : 'chainA');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="chainA">{chains.chainA.name}</option>
                  <option value="chainB">{chains.chainB.name}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Chain
                </label>
                <select
                  value={toChain}
                  onChange={(e) => {
                    setToChain(e.target.value);
                    if (e.target.value === fromChain) {
                      setFromChain(e.target.value === 'chainA' ? 'chainB' : 'chainA');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="chainA">{chains.chainA.name}</option>
                  <option value="chainB">{chains.chainB.name}</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleCrossChainTransfer}
              disabled={isTransferring || !soulIds[fromChain] || !soulIds[toChain]}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isTransferring ? 'Transferring...' : `Transfer ${transferType} Cross-Chain`}
            </button>
          </>
        )}
        
        {transferError && (
          <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-md text-red-700">
            {transferError}
          </div>
        )}
        
        {transferSuccess && (
          <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-md text-green-700">
            {transferSuccess}
          </div>
        )}
      </div>
      
      {/* How It Works */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">How Cross-Chain Transfers Work</h2>
        
        <ol className="list-decimal pl-5 space-y-4">
          <li className="text-gray-700">
            <span className="font-medium">Create Soul Identities</span>: First, create Soul Identities on both chains by connecting to each chain and clicking "Create".
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Select Transfer Type</span>: Choose whether to transfer Reputation or Rewards across chains.
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Specify Amount</span>: Enter the amount you want to transfer.
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Select Source and Destination</span>: Choose which chain to transfer from and to.
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Initiate Transfer</span>: Click the transfer button to start the cross-chain transfer process.
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Wait for Confirmation</span>: The transfer will be initiated on the source chain, and after confirmation, a message will be sent to the destination chain.
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Receive on Destination</span>: The bridge adapter on the destination chain will receive the message and credit the appropriate asset to your Soul Identity.
          </li>
        </ol>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
          <p className="font-medium mb-2">Note:</p>
          <p>Cross-chain transfers are not instant. It may take some time for the message to be processed on the destination chain. In a real-world scenario, this could take minutes to hours depending on the bridge technology used.</p>
        </div>
      </div>
    </div>
  );
}
