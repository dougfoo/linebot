# LINE Stock Bot

A serverless LINE chatbot built on Google Cloud Platform that provides stock price information.

## Features

- 📈 Stock price queries via `/stock <ticker>` command
- 🤖 Interactive help system
- ☁️ Serverless architecture on Google Cloud Functions
- 🔒 Secure credential management with Secret Manager
- ⚡ Fast response times with dummy data (Phase 1)

## Quick Start

### Prerequisites
- Google Cloud Platform account with billing enabled
- LINE Developers account
- Node.js 18+ and gcloud CLI installed

### Setup Commands

```bash
# 1. Set up GCP project
./setup-gcp.sh

# 2. Store LINE credentials (edit file first)
./store-secrets.sh

# 3. Deploy webhook function
./deploy.sh
```

### Usage

Send these commands to your LINE bot:

- `/stock AAPL` - Get Apple stock price
- `/stock TSLA` - Get Tesla stock price  
- `/help` - Show available commands

## Architecture

```
LINE App → Cloud Functions → Secret Manager
     ↓           ↓              ↓
  Webhook → Stock Handler → LINE Response
```

## Development Status

- ✅ **Phase 1**: Basic `/stock` command with dummy data
- 🔄 **Phase 2**: Real stock API integration (planned)
- 🔄 **Phase 3**: Calendar functionality (planned)

## Documentation

- [Design Architecture](./DESIGN.md) - Technical design and architecture
- [LINE Setup Guide](./LINE_SETUP.md) - Complete LINE platform setup
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Development roadmap
- [Phase 1 Status](./PHASE1_STATUS.md) - Current implementation status

## Project Structure

```
linebot/
├── functions/webhook/     # Cloud Function source
├── shared/               # Shared utilities
├── docs/                # Documentation
├── scripts/             # Setup and deployment scripts
└── README.md            # This file
```

## Contributing

This is a personal learning project. Feel free to fork and adapt for your own use.

## License

MIT License - Feel free to use and modify.