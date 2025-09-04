/**
 * Microsoft Teams Meeting Scheduler Tool
 * Standalone Express server implementation for Railway deployment
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Microsoft Graph API client
class MicrosoftGraphClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private tenantId: string
  ) {}

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    } catch (error) {
      throw new Error(`Failed to authenticate with Microsoft Graph: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createMeeting(meetingData: any, userId?: string): Promise<any> {
    await this.authenticate();

    const endpoint = userId 
      ? `https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings`
      : 'https://graph.microsoft.com/v1.0/me/onlineMeetings';

    const meetingPayload = {
      startDateTime: meetingData.startDateTime,
      endDateTime: meetingData.endDateTime,
      subject: meetingData.subject,
      ...(meetingData.description && { externalId: meetingData.description }),
      allowAttendeeToEnableCamera: meetingData.allowCamera ?? true,
      allowAttendeeToEnableMic: meetingData.allowMicrophone ?? true,
      allowRecording: meetingData.allowRecording ?? false,
      allowMeetingChat: 'enabled',
      allowedPresenters: 'everyone',
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Meeting creation failed: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create Teams meeting: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    tool_metadata: {
      name: 'meeting-scheduler',
      description: 'Schedules meetings through Microsoft Teams using Microsoft Graph API',
      version: '1.0.0',
      capabilities: ['meeting-scheduling', 'teams-integration', 'calendar-management'],
    },
    timestamp: new Date().toISOString(),
  });
});

// Execute endpoint
app.post('/api/execute', async (req: Request, res: Response): Promise<void> => {
  const executionId = generateId();
  console.log(`Executing meeting-scheduler tool with execution ID: ${executionId}`);

  try {
    const { input_data, config } = req.body;

    // Get configuration from request or environment
    const clientId = config?.client_id || process.env.CLIENT_ID;
    const clientSecret = config?.client_secret || process.env.CLIENT_SECRET;
    const tenantId = config?.tenant_id || process.env.TENANT_ID;
    const userId = config?.user_id || process.env.USER_ID;

    // Validate configuration
    if (!clientId || !clientSecret || !tenantId) {
      res.status(400).json({
        execution_id: executionId,
        status: 'error',
        error_code: 'CONFIGURATION_ERROR',
        error_message: 'Missing required Microsoft Graph API configuration',
        error_details: {
          missingKeys: [
            !clientId && 'client_id',
            !clientSecret && 'client_secret',
            !tenantId && 'tenant_id',
          ].filter(Boolean),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate input
    if (!input_data?.subject || !input_data?.startDateTime || !input_data?.endDateTime) {
      res.status(400).json({
        execution_id: executionId,
        status: 'error',
        error_code: 'VALIDATION_ERROR',
        error_message: 'Missing required input fields',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate dates
    const startTime = new Date(input_data.startDateTime);
    const endTime = new Date(input_data.endDateTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      res.status(400).json({
        execution_id: executionId,
        status: 'error',
        error_code: 'VALIDATION_ERROR',
        error_message: 'Invalid date format. Please use ISO format',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (endTime <= startTime) {
      res.status(400).json({
        execution_id: executionId,
        status: 'error',
        error_code: 'VALIDATION_ERROR',
        error_message: 'End time must be after start time',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Create meeting
    console.log(`Creating Teams meeting: "${input_data.subject}"`);
    const graphClient = new MicrosoftGraphClient(clientId, clientSecret, tenantId);
    const meetingResult = await graphClient.createMeeting(input_data, userId);

    // Return success response
    res.json({
      execution_id: executionId,
      status: 'success',
      data: {
        meeting: {
          meeting_id: meetingResult.id,
          join_url: meetingResult.joinUrl,
          subject: meetingResult.subject,
          start_time: meetingResult.startDateTime,
          end_time: meetingResult.endDateTime,
        },
        summary: `Successfully created Teams meeting "${input_data.subject}"`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error creating Teams meeting:', error);
    res.status(500).json({
      execution_id: executionId,
      status: 'error',
      error_code: 'INTERNAL_ERROR',
      error_message: error instanceof Error ? error.message : 'An error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Microsoft Teams Meeting Scheduler',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      execute: 'POST /api/execute',
    },
  });
});

// Helper function to generate execution ID
function generateId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Meeting Scheduler Tool started on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});