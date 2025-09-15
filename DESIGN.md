# LINE Chatbot Design Documentation

## Overview

A serverless LINE chatbot built on Google Cloud Platform that provides stock price information and Google Calendar integration. The bot supports two main command types:
- `/stock <ticker>` - Returns current stock price information
- `/cal <add|show>` - Calendar management (add events or show next 3 events)

## Architecture

### High-Level Architecture

```
LINE App → Cloud Load Balancer → Cloud Functions → GCP Services
                                        ↓
                            [Stock Function] [Calendar Function]
                                   ↓              ↓
                            [External API]  [Google Calendar API]
```

### Serverless Design Benefits

- **No Database Required**: Stateless design eliminates traditional database needs
- **Cost Effective**: Pay-per-use model with automatic scaling to zero
- **Maintenance Free**: Managed infrastructure with built-in monitoring
- **Secure**: Native GCP security and identity integration

## Technology Stack

### Core Services
- **Cloud Functions**: HTTP-triggered serverless functions
- **Secret Manager**: Secure storage for API keys and credentials
- **Cloud Storage**: Temporary state management for OAuth flows
- **Cloud Logging**: Automatic logging and monitoring

### External APIs
- **LINE Messaging API**: Bot communication platform
- **Google Calendar API**: Native GCP calendar integration
- **Financial Data API**: Stock price information (Alpha Vantage/Yahoo Finance)

### Runtime
- **Node.js**: JavaScript runtime for all functions
- **Express.js**: HTTP request handling (minimal usage)

## Component Design

### 1. Main Webhook Function (`webhook/`)
**Purpose**: Central entry point for all LINE messages

**Responsibilities**:
- Validate LINE webhook signatures
- Parse incoming messages and commands
- Route commands to appropriate handler functions
- Send responses back to LINE users

**Trigger**: HTTP POST from LINE platform

### 2. Stock Service Function (`stock/`)
**Purpose**: Handle stock price queries

**Flow**:
1. Parse ticker symbol from command
2. Validate ticker format
3. Call external financial API
4. Format response with price, change, timestamp
5. Return formatted message

**Error Handling**:
- Invalid ticker symbols
- API rate limits
- Market hours consideration

### 3. Calendar Service Function (`calendar/`)
**Purpose**: Handle Google Calendar integration

**Flow for `/cal add`**:
1. Parse event details from message
2. Check user's OAuth status
3. If not authenticated, initiate OAuth flow
4. Create calendar event via Google Calendar API
5. Send confirmation message

**Flow for `/cal show`**:
1. Verify user authentication
2. Query Google Calendar API for next 3 events
3. Format events with date, time, title
4. Send formatted list to user

## File Structure

```
linebot/
├── functions/
│   ├── webhook/                 # Main LINE webhook handler
│   │   ├── index.js            # Main function entry point
│   │   └── package.json        # Function dependencies
│   ├── stock/                   # Stock command handler
│   │   ├── index.js            # Stock API integration
│   │   └── package.json        # Dependencies
│   └── calendar/                # Calendar command handler
│       ├── index.js            # Google Calendar integration
│       └── package.json        # Dependencies
├── shared/                      # Shared utilities
│   ├── lineClient.js           # LINE SDK wrapper
│   ├── validators.js           # Input validation
│   └── auth.js                 # OAuth utilities
├── docs/                       # Documentation
│   ├── DESIGN.md              # This file
│   ├── LINE_SETUP.md          # LINE platform setup
│   └── IMPLEMENTATION_PLAN.md  # Development roadmap
├── deploy.sh                   # Deployment script
├── cloudbuild.yaml            # CI/CD configuration
└── .env.example               # Environment variables template
```

## Command Processing

### Stock Command Flow
```
User: "/stock AAPL"
  ↓
Parse command → Validate ticker → API call → Format response → Send to LINE
```

**Response Format**:
```
📈 AAPL - Apple Inc.
💰 $175.43 (+2.15 +1.24%)
📅 Last updated: 2025-01-15 16:00 EST
```

### Calendar Command Flow

**Add Event**:
```
User: "/cal add Team meeting tomorrow 2pm"
  ↓
Parse → Check OAuth → Create event → Confirm
```

**Show Events**:
```
User: "/cal show"
  ↓
Check OAuth → Query Calendar → Format → Send list
```

**Response Format**:
```
📅 Your upcoming events:

1. Team Meeting
   🕐 Tomorrow 2:00 PM

2. Doctor Appointment  
   🕐 Jan 17, 10:30 AM

3. Project Review
   🕐 Jan 18, 3:00 PM
```

## Authentication & Security

### LINE Security
- Webhook signature verification using channel secret
- HTTPS-only communication
- Request validation and sanitization

### Google OAuth Flow
1. User triggers calendar command without authentication
2. System generates OAuth URL with state parameter
3. State stored temporarily in Cloud Storage with TTL
4. User completes OAuth flow
5. System exchanges code for tokens
6. Calendar operation proceeds

### Security Best Practices
- All API keys stored in Secret Manager
- Minimal IAM permissions for service accounts
- Input validation for all user commands
- Rate limiting for external API calls
- No sensitive data in logs

## Scalability Considerations

### Auto-scaling
- Cloud Functions automatically scale based on demand
- Zero cold starts after initial deployment
- Regional deployment for low latency

### Rate Limiting
- Implement backoff strategies for external APIs
- Cache stock data for short periods to reduce API calls
- Queue calendar operations if needed

### Cost Optimization
- Functions scale to zero when not in use
- Minimal memory allocation for simple operations
- Efficient API usage patterns

## Error Handling

### User-Facing Errors
- Clear, helpful error messages
- Command usage examples
- Graceful degradation for API failures

### System Errors
- Comprehensive logging via Cloud Logging
- Error alerting for critical failures
- Automatic retry mechanisms where appropriate

## Monitoring & Observability

### Built-in Monitoring
- Cloud Functions execution metrics
- Error rates and latency tracking
- API call success/failure rates

### Custom Metrics
- Command usage statistics
- User engagement patterns
- API response times

### Alerting
- Function failures
- High error rates
- External API outages

This design provides a robust, scalable foundation for a LINE chatbot with minimal operational overhead while leveraging Google Cloud Platform's managed services.