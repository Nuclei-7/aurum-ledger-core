
import { useState } from 'react';
import { Block } from '../blockchain/Block';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockExplorerProps {
  blocks: Block[];
  onSearch: (term: string) => void;
}

export function BlockExplorer({ blocks, onSearch }: BlockExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'blocks' | 'transactions'>('blocks');
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const handleSearch = () => {
    onSearch(searchTerm);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Input 
          placeholder="Search by block hash, transaction ID or address" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#161b22] border-gray-700 text-white"
        />
        <Button 
          variant="outline" 
          className="bg-[#ffd700] text-black hover:bg-[#e6c300] border-none"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={viewMode === 'blocks' ? 'default' : 'outline'} 
          onClick={() => setViewMode('blocks')}
          className={viewMode === 'blocks' ? 'bg-[#ffd700] text-black' : ''}
        >
          Blocks
        </Button>
        <Button 
          variant={viewMode === 'transactions' ? 'default' : 'outline'} 
          onClick={() => setViewMode('transactions')}
          className={viewMode === 'transactions' ? 'bg-[#ffd700] text-black' : ''}
        >
          Transactions
        </Button>
      </div>
      
      {viewMode === 'blocks' ? (
        <div className="space-y-4">
          {blocks.slice().reverse().map((block, index) => (
            <Card key={index} className="bg-[#21262d] border-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Block #{block.index}</span>
                  <span className="text-xs bg-[#0d1117] py-1 px-2 rounded text-gray-400">
                    {formatTime(block.timestamp)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-400 w-24">Hash:</span>
                    <span className="font-mono text-xs overflow-hidden text-ellipsis">{block.hash.substring(0, 20)}...</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24">Mined By:</span>
                    <span className="font-mono">{block.miner ? block.miner.substring(0, 16) + '...' : 'Genesis'}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                    <span>Transactions: {block.transactions.length}</span>
                    <span className="text-[#ffd700]">
                      {block.transactions.reduce((sum, tx) => sum + tx.amount, 0)} $AUR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.flatMap((block, blockIndex) => 
            block.transactions.map((tx, txIndex) => (
              <Card key={`${blockIndex}-${txIndex}`} className="bg-[#21262d] border-gray-800 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-base">
                    <span>Transaction {tx.txId.substring(0, 10)}...</span>
                    <span className="text-xs bg-[#0d1117] py-1 px-2 rounded text-gray-400">
                      Block #{block.index}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">From:</span>
                      <span>{tx.fromAddress ? tx.fromAddress.substring(0, 16) + '...' : 'Mining Reward'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">To:</span>
                      <span>{tx.toAddress.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                      <span>{formatTime(tx.timestamp)}</span>
                      <span className="text-[#ffd700]">{tx.amount} $AUR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
