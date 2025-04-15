
# Aurum.Gold ($AUR) - Custom Blockchain Implementation

Aurum.Gold is a custom blockchain implementation with a native cryptocurrency ($AUR), featuring a hybrid Proof of Work (PoW) and Proof of Stake (PoS) consensus mechanism.

## Features

- **Custom Blockchain Protocol**: Hybrid consensus mechanism that starts with PoW and can transition to PoS
- **Native $AUR Cryptocurrency**: Built-in token for transactions within the network
- **Wallet Functionality**: Create wallets, manage keys, and execute transactions
- **Node Setup and Syncing**: Network synchronization between nodes
- **Block Explorer**: Visualize blockchain data and transactions
- **Dashboard**: Monitor the blockchain and wallet status

## Technical Details

### Blockchain Core

The blockchain implements a standard chain of blocks, each containing:
- Block header (index, timestamp, previous hash, etc.)
- Transaction data
- Mining information

### Consensus Mechanism

- **Initial Phase**: Proof of Work (PoW) with adaptive difficulty
- **Later Phase**: Ability to transition to Proof of Stake (PoS) when network matures
- **Hybrid Mode**: Combined PoW/PoS for enhanced security and efficiency

### Wallet System

- Secure key pair generation
- Transaction signing and verification
- Balance management
- Transaction history

### Network Layer

- Node-to-node communication
- Block and transaction propagation
- Network synchronization

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to `http://localhost:8080`

## Development Roadmap

### Phase 1 (Current)
- Core blockchain implementation
- Basic wallet functionality
- Local node simulation
- Explorer/Dashboard UI

### Phase 2 (Planned)
- Smart contract integration
- Enhanced PoS implementation
- Improved network synchronization
- Mobile wallet application

### Phase 3 (Future)
- Governance mechanism
- Cross-chain compatibility
- Advanced privacy features
- Decentralized applications platform

## License

This project is licensed under the MIT License - see the LICENSE file for details.
