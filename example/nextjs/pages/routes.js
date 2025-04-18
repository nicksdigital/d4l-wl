import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useSoulStream } from '../contexts/SoulStreamContext';

export default function Routes() {
  const { account, connectWallet } = useWeb3();
  const { soulId, soulIdentity, registry, authorizeRoute, isRouteAuthorized } = useSoulStream();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingRoute, setUpdatingRoute] = useState(null);

  // Fetch routes (mock data for demo)
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!soulId || !registry) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, you would fetch this from events or an API
        // This is mock data for demonstration
        const mockRoutes = [
          {
            id: ethers.keccak256(ethers.toUtf8Bytes('route1')),
            fromSoul: soulId,
            toSoul: '0x1234567890123456789012345678901234567890',
            asset: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            assetName: 'Community Reputation',
            assetSymbol: 'CREP',
            action: 1, // Transfer
            actionName: 'Transfer',
            router: '0x0987654321098765432109876543210987654321',
            active: true,
            authorized: false // Will be updated
          },
          {
            id: ethers.keccak256(ethers.toUtf8Bytes('route2')),
            fromSoul: soulId,
            toSoul: ethers.ZeroAddress,
            asset: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
            assetName: 'Community Rewards',
            assetSymbol: 'CRWD',
            action: 2, // Claim
            actionName: 'Claim',
            router: '0x0987654321098765432109876543210987654321',
            active: true,
            authorized: false // Will be updated
          }
        ];
        
        // Check authorization for each route
        if (soulIdentity) {
          for (let i = 0; i < mockRoutes.length; i++) {
            try {
              mockRoutes[i].authorized = await isRouteAuthorized(mockRoutes[i].id);
            } catch (e) {
              console.error('Error checking route authorization:', e);
              // Continue with default value
            }
          }
        }
        
        setRoutes(mockRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setError(error.message || 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, [soulId, registry, soulIdentity, isRouteAuthorized]);

  const handleAuthorizeRoute = async (routeId, authorized) => {
    if (!soulIdentity) return;
    
    setUpdatingRoute(routeId);
    
    try {
      await authorizeRoute(routeId, authorized);
      
      // Update the routes list
      setRoutes(routes.map(route => 
        route.id === routeId 
          ? { ...route, authorized } 
          : route
      ));
    } catch (error) {
      console.error('Error authorizing route:', error);
      alert(`Error: ${error.message || 'Failed to authorize route'}`);
    } finally {
      setUpdatingRoute(null);
    }
  };

  // Format address
  const formatAddress = (address) => {
    if (!address || address === ethers.ZeroAddress) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!account) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Routes</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to view your routes.</p>
        <button 
          onClick={connectWallet} 
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!soulId) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Routes</h1>
        <p className="text-gray-600 mb-6">You need to create a Soul Identity first.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="btn btn-primary"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Your Routes</h1>
      
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Authorized Routes</h3>
          <div className="text-sm text-gray-500">
            Soul ID: {formatAddress(soulId)}
          </div>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading routes...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            {error}
          </div>
        ) : routes.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No routes found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Soul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authorization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {route.assetName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {route.assetSymbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.actionName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAddress(route.toSoul)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {route.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleAuthorizeRoute(route.id, !route.authorized)}
                          disabled={updatingRoute === route.id || !route.active}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            route.authorized ? 'bg-primary-600' : 'bg-gray-200'
                          } ${!route.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              route.authorized ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="ml-2">
                          {updatingRoute === route.id ? 'Updating...' : (route.authorized ? 'Authorized' : 'Unauthorized')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">About Routes</h3>
        <p className="text-gray-600 mb-4">
          Routes define how assets can flow between Soul Identities. By authorizing a route, you allow the specified action to be performed on your assets.
        </p>
        
        <div className="space-y-4 mt-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="font-medium mb-1">Transfer Routes</div>
            <div className="text-sm text-gray-600">
              Allow your assets to be transferred to another Soul Identity.
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="font-medium mb-1">Claim Routes</div>
            <div className="text-sm text-gray-600">
              Allow rewards to be claimed from reward programs.
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="font-medium mb-1">Cross-Chain Routes</div>
            <div className="text-sm text-gray-600">
              Allow your assets to be transferred across different blockchain networks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
