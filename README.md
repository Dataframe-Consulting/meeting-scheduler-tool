# Microsoft Teams Meeting Scheduler

An AI Spine tool that schedules Microsoft Teams meetings through the Microsoft Graph API. This tool allows you to programmatically create Teams meetings with customizable settings including participant permissions, recording options, and meeting details.

## Prerequisites

Before using this tool, you need to set up Microsoft Graph API access:

1. **Azure App Registration**: Create an app registration in the Azure Portal
2. **API Permissions**: Grant the following permissions:
   - `OnlineMeetings.ReadWrite.All` (Application permission)
   - `User.Read.All` (Application permission for user lookup)
3. **Admin Consent**: Grant admin consent for the application permissions
4. **Application Access Policy**: Configure an application access policy if needed

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Microsoft Graph API credentials

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Usage

This tool implements the AI Spine universal contract and can be used with any AI Spine platform.

### Local Development

Start the development server:

```bash
npm run dev
```

The tool will be available at `http://localhost:3000` with the following endpoints:

- `GET /health` - Health check and tool metadata
- `POST /execute` - Execute the tool with input data

### Testing the Tool

You can test the tool using curl or any HTTP client:

```bash
# Health check
curl http://localhost:3001/health

# Create a Teams meeting
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input_data": {
      "subject": "Weekly Team Meeting",
      "startDateTime": "2025-09-10T14:30:00Z",
      "endDateTime": "2025-09-10T15:30:00Z",
      "attendees": ["john@example.com", "jane@example.com"],
      "description": "Weekly team sync to discuss project progress",
      "allowRecording": true
    },
    "config": {
      "client_id": "your-azure-app-client-id",
      "client_secret": "your-azure-app-client-secret",
      "tenant_id": "your-azure-tenant-id",
      "user_id": "organizer@yourdomain.com"
    }
  }'
```

### Configuration

The tool can be configured using environment variables:

**Server Configuration:**
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `API_KEY_AUTH` - Enable API key authentication (true/false)
- `VALID_API_KEYS` - Comma-separated list of valid API keys

**Microsoft Teams Integration (Required):**
- `CLIENT_ID` - Microsoft Graph API client ID
- `CLIENT_SECRET` - Microsoft Graph API client secret
- `TENANT_ID` - Microsoft Azure tenant ID
- `USER_ID` - User ID or email for meeting creation (optional)

### Deployment

#### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t meeting-scheduler .

# Run the container
docker run -p 3000:3000 meeting-scheduler
```

#### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

#### AI Spine Platform

Deploy to the AI Spine platform:

```bash
npm run deploy
```

## Development

### Project Structure

```
meeting-scheduler/
├── src/
│   └── index.ts          # Main tool implementation
├── tests/
│   └── tool.test.ts      # Test files
├── Dockerfile                # Docker configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

### Adding Features

1. Update the tool schema in `src/index.ts`
2. Implement the new functionality in the `execute` function
3. Add tests for the new features
4. Update this README with usage examples

### Input Schema

The tool accepts the following input parameters:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | ✅ | Subject/title of the meeting |
| `startDateTime` | string | ✅ | Start date and time in ISO format (e.g., 2025-09-03T14:30:00Z) |
| `endDateTime` | string | ✅ | End date and time in ISO format (e.g., 2025-09-03T15:30:00Z) |
| `attendees` | string[] | ❌ | List of attendee email addresses (max 50) |
| `description` | string | ❌ | Optional meeting description (max 1000 characters) |
| `allowCamera` | boolean | ❌ | Whether to allow attendees to enable camera (default: true) |
| `allowMicrophone` | boolean | ❌ | Whether to allow attendees to enable microphone (default: true) |
| `allowRecording` | boolean | ❌ | Whether to allow meeting recording (default: false) |

### Configuration Schema

The tool requires the following configuration:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | string | ✅ | Microsoft Graph API client ID |
| `client_secret` | string | ✅ | Microsoft Graph API client secret |
| `tenant_id` | string | ✅ | Microsoft Azure tenant ID |
| `user_id` | string | ❌ | User ID or email for meeting creation |

## API Reference

### Health Check

**GET /health**

Returns tool metadata and health status.

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "tool_metadata": {
    "name": "meeting-scheduler",
    "description": "Schedules meetings through Microsoft Teams on command",
    "capabilities": ["..."]
  },
  "uptime_seconds": 1234,
  "last_execution": "2024-01-01T00:00:00Z"
}
```

### Create Meeting

**POST /api/execute**

Creates a Microsoft Teams meeting with the provided parameters.

Request:
```json
{
  "input_data": {
    "subject": "Weekly Team Meeting",
    "startDateTime": "2025-09-10T14:30:00Z",
    "endDateTime": "2025-09-10T15:30:00Z",
    "attendees": ["john@example.com", "jane@example.com"],
    "description": "Weekly team sync to discuss project progress",
    "allowCamera": true,
    "allowMicrophone": true,
    "allowRecording": false
  },
  "config": {
    "client_id": "your-azure-app-client-id",
    "client_secret": "your-azure-app-client-secret",
    "tenant_id": "your-azure-tenant-id",
    "user_id": "organizer@yourdomain.com"
  }
}
```

Success Response:
```json
{
  "execution_id": "exec_123",
  "status": "success",
  "data": {
    "meeting": {
      "meeting_id": "19:meeting_xxx",
      "join_url": "https://teams.microsoft.com/l/meetup-join/...",
      "conference_id": "123456789",
      "dial_in_url": "https://dialin.teams.microsoft.com/...",
      "subject": "Weekly Team Meeting",
      "start_time": "2025-09-10T14:30:00Z",
      "end_time": "2025-09-10T15:30:00Z",
      "created_at": "2025-09-03T17:21:33Z",
      "organizer": "John Doe",
      "settings": {
        "allow_camera": true,
        "allow_microphone": true,
        "allow_recording": false,
        "chat_enabled": true
      }
    },
    "summary": "Successfully created Teams meeting \"Weekly Team Meeting\" for 2025-09-10T14:30:00Z",
    "attendees_count": 2,
    "instructions": [
      "Share the join URL with attendees to join the meeting",
      "Meeting will be available 15 minutes before the start time",
      "Recording is disabled for this meeting"
    ]
  },
  "execution_time_ms": 1234,
  "timestamp": "2025-09-03T17:21:33Z"
}
```

Error Response:
```json
{
  "execution_id": "exec_123",
  "status": "error",
  "error_code": "AUTHENTICATION_ERROR",
  "error_message": "Failed to authenticate with Microsoft Graph: Authentication failed",
  "execution_time_ms": 500,
  "timestamp": "2025-09-03T17:21:33Z"
}
```

## Azure Setup Guide

### 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Enter application name (e.g., "Teams Meeting Scheduler")
4. Set redirect URI to `https://login.microsoftonline.com/common/oauth2/nativeclient`
5. Click "Register"

### 2. Configure API Permissions

1. In your app registration, go to "API permissions"
2. Click "Add a permission" → Microsoft Graph → Application permissions
3. Add the following permissions:
   - `OnlineMeetings.ReadWrite.All`
   - `User.Read.All` (optional, for user lookup)
4. Click "Grant admin consent" (requires admin privileges)

### 3. Create Client Secret

1. Go to "Certificates & secrets" → "Client secrets"
2. Click "New client secret"
3. Enter description and select expiration
4. Copy the secret value (you won't be able to see it again)

### 4. Get Configuration Values

- **Client ID**: Found in "Overview" → Application (client) ID
- **Tenant ID**: Found in "Overview" → Directory (tenant) ID
- **Client Secret**: The secret you created in step 3

### 5. Configure Application Access Policy (Optional)

If you need to create meetings on behalf of specific users:

```powershell
# Install Microsoft Graph PowerShell if not already installed
Install-Module Microsoft.Graph

# Connect to your tenant
Connect-MgGraph -Scopes "Policy.ReadWrite.ApplicationConfiguration"

# Create application access policy
New-MgIdentityConditionalAccessPolicy -DisplayName "Teams Meeting Scheduler Policy" -State "enabled"
```

## Troubleshooting

### Common Issues

1. **"Tenant not found" error**: Verify your tenant ID is correct
2. **"Insufficient privileges" error**: Ensure admin consent is granted for API permissions
3. **"Application access denied" error**: Configure application access policy for the target users
4. **Invalid date format**: Use ISO 8601 format (e.g., `2025-09-03T14:30:00Z`)

### Debugging

Enable detailed logging by setting:
```bash
LOG_LEVEL=debug
NODE_ENV=development
```

## License

MIT License - see LICENSE file for details.

## Support

For support and documentation, visit [AI Spine Documentation](https://docs.ai-spine.com/tools).