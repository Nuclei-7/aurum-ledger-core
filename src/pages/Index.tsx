
import { useState, useEffect } from 'react';
import { BlockchainNode } from '../network/Node';
import { Wallet } from '../wallet/Wallet';
import { Blockchain } from '../blockchain/Blockchain';
import { Transaction } from '../blockchain/Transaction';
import { BlockExplorer } from '../components/BlockExplorer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Initialize the blockchain
const blockchain = new Blockchain();
const node = new BlockchainNode();

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallet, setWallet] = useState(node.wallet);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState(node.blockchain.chain);
  const [networkStats, setNetworkStats] = useState(node.getNetworkStatus());
  const [transactionStatus, setTransactionStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletPassword, setWalletPassword] = useState('');
  const [walletName, setWalletName] = useState('');

  // Update UI data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks([...node.blockchain.chain]);
      setTransactions([...node.pendingTransactions]);
      setNetworkStats(node.getNetworkStatus());
    }, 5000);

    // Listen for node events
    node.on('transaction-received', () => {
      setTransactions([...node.pendingTransactions]);
    });
    
    node.on('block-received', () => {
      setBlocks([...node.blockchain.chain]);
    });
    
    node.on('mining-started', () => {
      setIsLoading(true);
    });
    
    node.on('mining-completed', () => {
      setIsLoading(false);
      setBlocks([...node.blockchain.chain]);
      setTransactions([...node.pendingTransactions]);
    });

    return () => {
      clearInterval(interval);
      
      // Remove event listeners
      node.removeAllListeners();
    };
  }, []);

  const handleSendTransaction = () => {
    setIsLoading(true);
    setTransactionStatus('');
    
    setTimeout(() => {
      if (!recipient || !amount || parseFloat(amount) <= 0) {
        setTransactionStatus('Invalid recipient or amount');
        setIsLoading(false);
        return;
      }
      
      try {
        const result = wallet.sendTransaction(recipient, parseFloat(amount));
        
        if (result) {
          setTransactionStatus('Transaction sent successfully!');
          setRecipient('');
          setAmount('');
          
          // Broadcast the transaction to the network
          node.broadcastTransaction(node.pendingTransactions[node.pendingTransactions.length - 1]);
          
          // Update the pending transactions
          setTransactions([...node.pendingTransactions]);
        } else {
          setTransactionStatus('Failed to send transaction. Check your balance.');
        }
      } catch (error) {
        console.error(error);
        setTransactionStatus('Transaction error: ' + (error as Error).message);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleMineBlock = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      node.mineBlock();
    }, 500);
  };

  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setTransactionStatus('Invalid stake amount');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      const result = wallet.stake(parseFloat(amount));
      
      if (result) {
        setTransactionStatus('Stake successful!');
        setAmount('');
        // Enable PoS after some staking activity
        if (Math.random() > 0.5) {
          node.blockchain.switchToProofOfStake();
        }
      } else {
        setTransactionStatus('Failed to stake. Check your balance.');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const saveWallet = () => {
    if (!walletPassword || !walletName) {
      setTransactionStatus('Please enter wallet name and password');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const result = wallet.saveToFile(`./wallets/${walletName}.json`, walletPassword);
        
        if (result) {
          setTransactionStatus('Wallet saved successfully!');
          setWalletPassword('');
          setWalletName('');
        } else {
          setTransactionStatus('Failed to save wallet');
        }
      } catch (error) {
        console.error(error);
        setTransactionStatus('Error saving wallet: ' + (error as Error).message);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#161b22]">
      <header className="py-6 border-b border-gray-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffd700] flex items-center justify-center">
              <span className="text-black font-bold">₳</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Aurum.Gold Blockchain</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#21262d] rounded-full text-sm text-green-400">
              Network: Active ({networkStats.peers} peer{networkStats.peers !== 1 ? 's' : ''})
            </div>
            <div className="px-3 py-1 bg-[#21262d] rounded-full text-sm text-white">
              Blocks: {networkStats.blockchain.blocks}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>Blockchain Summary</CardTitle>
                  <CardDescription className="text-gray-400">Overview of the blockchain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Blocks:</span>
                    <span className="font-medium">{blocks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mining Difficulty:</span>
                    <span className="font-medium">{networkStats.blockchain.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Consensus:</span>
                    <span className="font-medium">{node.blockchain.stakingEnabled ? 'Proof of Stake' : 'Proof of Work'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pending Transactions:</span>
                    <span className="font-medium">{transactions.length}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 bg-[#ffd700] text-black hover:bg-[#e6c300] border-none"
                    onClick={handleMineBlock}
                    disabled={isLoading || transactions.length === 0}
                  >
                    {isLoading ? 'Mining...' : 'Mine Next Block'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>Your Wallet</CardTitle>
                  <CardDescription className="text-gray-400">Manage your $AUR tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Address:</span>
                    <span className="text-xs bg-[#161b22] py-1 px-2 rounded font-mono">{wallet.getAddress().substring(0, 16)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <span className="font-medium text-[#ffd700]">{wallet.getBalance()} $AUR</span>
                  </div>
                  {node.blockchain.stakingEnabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Staked:</span>
                      <span className="font-medium">{node.blockchain.stakers.get(wallet.getAddress()) || 0} $AUR</span>
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    <div>
                      <Input 
                        type="text" 
                        placeholder="Recipient Address" 
                        value={recipient} 
                        onChange={(e) => setRecipient(e.target.value)}
                        className="bg-[#161b22] border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[#161b22] border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="w-full bg-[#ffd700] text-black hover:bg-[#e6c300] border-none"
                    onClick={handleSendTransaction}
                    disabled={isLoading}
                  >
                    Send $AUR
                  </Button>
                  
                  {node.blockchain.stakingEnabled && (
                    <Button 
                      variant="outline" 
                      className="w-full ml-2 bg-[#30363d] text-white hover:bg-[#444c56] border-none"
                      onClick={handleStake}
                      disabled={isLoading}
                    >
                      Stake $AUR
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {transactionStatus && (
              <Alert className="mt-6 bg-[#21262d] border-gray-800 text-white">
                <AlertTitle>Transaction Status</AlertTitle>
                <AlertDescription>
                  {transactionStatus}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6">
              <Card className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>Latest Transactions</CardTitle>
                  <CardDescription className="text-gray-400">Most recent transaction activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-400">Tx ID</TableHead>
                        <TableHead className="text-gray-400">From</TableHead>
                        <TableHead className="text-gray-400">To</TableHead>
                        <TableHead className="text-gray-400 text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">No pending transactions</TableCell>
                        </TableRow>
                      ) : (
                        transactions.slice(0, 5).map((tx, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{tx.txId.substring(0, 10)}...</TableCell>
                            <TableCell>{tx.fromAddress ? tx.fromAddress.substring(0, 10) + '...' : 'Mining Reward'}</TableCell>
                            <TableCell>{tx.toAddress.substring(0, 10)}...</TableCell>
                            <TableCell className="text-right">{tx.amount} $AUR</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-6 mt-6">
            <Card className="bg-[#21262d] border-gray-800 text-white">
              <CardHeader>
                <CardTitle>Wallet Details</CardTitle>
                <CardDescription className="text-gray-400">Manage your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#161b22] rounded-md">
                  <h3 className="text-lg font-medium mb-2">Your Address</h3>
                  <p className="font-mono break-all bg-[#0d1117] p-2 rounded text-sm">{wallet.getAddress()}</p>
                </div>
                
                <div className="p-4 bg-[#161b22] rounded-md">
                  <h3 className="text-lg font-medium mb-2">Public Key</h3>
                  <p className="font-mono break-all bg-[#0d1117] p-2 rounded text-xs h-20 overflow-auto">{wallet.getPublicKey()}</p>
                </div>
                
                <div className="p-4 bg-[#161b22] rounded-md">
                  <h3 className="text-lg font-medium mb-2">Balance</h3>
                  <p className="text-2xl font-bold text-[#ffd700]">{wallet.getBalance()} $AUR</p>
                </div>
                
                <div className="p-4 bg-[#161b22] rounded-md">
                  <h3 className="text-lg font-medium mb-2">Backup Wallet</h3>
                  <div className="space-y-3">
                    <Input 
                      type="text" 
                      placeholder="Wallet Name" 
                      value={walletName} 
                      onChange={(e) => setWalletName(e.target.value)}
                      className="bg-[#0d1117] border-gray-700 text-white"
                    />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      value={walletPassword} 
                      onChange={(e) => setWalletPassword(e.target.value)}
                      className="bg-[#0d1117] border-gray-700 text-white"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full bg-[#ffd700] text-black hover:bg-[#e6c300] border-none"
                      onClick={saveWallet}
                      disabled={isLoading}
                    >
                      Save Wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#21262d] border-gray-800 text-white">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription className="text-gray-400">Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Transaction</TableHead>
                      <TableHead className="text-gray-400">From/To</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                      <TableHead className="text-gray-400 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallet.getTransactionHistory().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">No transactions yet</TableCell>
                      </TableRow>
                    ) : (
                      wallet.getTransactionHistory().map((tx, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {tx.fromAddress === wallet.getAddress() ? 'Sent' : 'Received'}
                          </TableCell>
                          <TableCell>
                            {tx.fromAddress === wallet.getAddress() 
                              ? `To: ${tx.toAddress.substring(0, 12)}...` 
                              : (tx.fromAddress ? `From: ${tx.fromAddress.substring(0, 12)}...` : 'Mining Reward')}
                          </TableCell>
                          <TableCell>{formatTime(tx.timestamp)}</TableCell>
                          <TableCell className={`text-right ${tx.fromAddress === wallet.getAddress() ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.fromAddress === wallet.getAddress() ? '-' : '+'}{tx.amount} $AUR
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="explorer" className="space-y-6 mt-6">
            <Card className="bg-[#21262d] border-gray-800 text-white">
              <CardHeader>
                <CardTitle>Blockchain Explorer</CardTitle>
                <CardDescription className="text-gray-400">Browse all blockchain blocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <BlockExplorer 
                  blocks={blocks} 
                  onSearch={(term) => {
                    console.log("Searching for:", term);
                    // In a real implementation, this would filter blocks/transactions
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="network" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>Network Status</CardTitle>
                  <CardDescription className="text-gray-400">Current blockchain network status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Network Type:</span>
                    <span className="font-medium">Mainnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Consensus:</span>
                    <span className="font-medium">{node.blockchain.stakingEnabled ? 'Proof of Stake' : 'Proof of Work'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Nodes:</span>
                    <span className="font-medium">{networkStats.peers + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Block Height:</span>
                    <span className="font-medium">{networkStats.blockchain.blocks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mining Difficulty:</span>
                    <span className="font-medium">{networkStats.blockchain.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mining Reward:</span>
                    <span className="font-medium text-[#ffd700]">{node.blockchain.miningReward} $AUR</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 bg-[#30363d] text-white hover:bg-[#444c56] border-none"
                    onClick={() => node.syncWithNetwork()}
                    disabled={isLoading}
                  >
                    Sync with Network
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>Network Peers</CardTitle>
                  <CardDescription className="text-gray-400">Connected nodes in the network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#161b22] rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Local Node (You)</span>
                      </div>
                      <span className="text-xs bg-[#0d1117] py-1 px-2 rounded">127.0.0.1:8080</span>
                    </div>
                    
                    <div className="p-3 bg-[#161b22] rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Seed Node</span>
                      </div>
                      <span className="text-xs bg-[#0d1117] py-1 px-2 rounded">seed1.aurum.gold</span>
                    </div>
                    
                    <div className="p-3 bg-[#161b22] rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span>Mining Node</span>
                      </div>
                      <span className="text-xs bg-[#0d1117] py-1 px-2 rounded">miner2.aurum.gold</span>
                    </div>
                    
                    <div className="mt-6">
                      <Input 
                        type="text" 
                        placeholder="Node address (e.g. node.aurum.gold)" 
                        className="bg-[#161b22] border-gray-700 text-white"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full mt-3 bg-[#30363d] text-white hover:bg-[#444c56] border-none"
                      >
                        Connect to Node
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-[#21262d] border-gray-800 text-white">
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
                <CardDescription className="text-gray-400">Performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Transactions/Block</h3>
                    <p className="text-2xl font-bold">
                      {blocks.reduce((avg, block, _, { length }) => {
                        return avg + block.transactions.length / length;
                      }, 0).toFixed(1)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Block Time</h3>
                    <p className="text-2xl font-bold">~10 min</p>
                  </div>
                  
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Hashrate</h3>
                    <p className="text-2xl font-bold">32 H/s</p>
                  </div>
                  
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Total Supply</h3>
                    <p className="text-2xl font-bold text-[#ffd700]">
                      {blocks.reduce((total, block) => {
                        return total + block.transactions.reduce((blockTotal, tx) => {
                          if (!tx.fromAddress) {
                            return blockTotal + tx.amount;
                          }
                          return blockTotal;
                        }, 0);
                      }, 0)} $AUR
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Staked Amount</h3>
                    <p className="text-2xl font-bold">
                      {Array.from(node.blockchain.stakers.values()).reduce((a, b) => a + b, 0)} $AUR
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#161b22] rounded-md text-center">
                    <h3 className="text-gray-400 text-sm mb-1">Network Version</h3>
                    <p className="text-2xl font-bold">1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
