/**
 * MeetingScheduler - Schedules meetings through Microsoft Teams on command
 * 
 * This AI Spine tool provides basic text processing capabilities with configurable
 * parameters and robust input validation. It demonstrates the fundamental patterns
 * for building AI Spine compatible tools.
 * 
 * Generated on 2025-09-03 using create-ai-spine-tool v1.0.0
 * Template: , Language: typescript
 * 
 * @fileoverview Main tool implementation for meeting-scheduler
 * @author AI Spine Developer
 * @since 1.0.0
 */

import { createTool, stringField, booleanField, apiKeyField } from '@ai-spine/tools';

/**
 * Microsoft Graph API client for Teams meeting creation
 */
class MicrosoftGraphClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private tenantId: string
  ) {}

  /**
   * Authenticate with Microsoft Graph API using client credentials flow
   */
  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return; // Token still valid
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
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 1 minute early
    } catch (error) {
      throw new Error(`Failed to authenticate with Microsoft Graph: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a Microsoft Teams meeting
   */
  async createMeeting(meetingData: {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    attendees?: string[];
    description?: string;
    allowCamera?: boolean;
    allowMicrophone?: boolean;
    allowRecording?: boolean;
  }, userId?: string): Promise<any> {
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

/**
 * Input interface defining the structure of data that users will provide
 * to this tool. This interface ensures type safety and enables automatic
 * validation and documentation generation.
 */
interface MeetingSchedulerInput {
  /** Subject/title of the meeting */
  subject: string;
  /** Start date and time in ISO format (e.g., 2025-09-03T14:30:00Z) */
  startDateTime: string;
  /** End date and time in ISO format (e.g., 2025-09-03T15:30:00Z) */
  endDateTime: string;
  /** List of attendee email addresses */
  attendees?: string[];
  /** Optional meeting description */
  description?: string;
  /** Whether to allow attendees to enable camera (defaults to true) */
  allowCamera?: boolean;
  /** Whether to allow attendees to enable microphone (defaults to true) */
  allowMicrophone?: boolean;
  /** Whether to allow meeting recording (defaults to false) */
  allowRecording?: boolean;
}

/**
 * Configuration interface defining settings that can be provided via
 * environment variables or configuration files. These settings typically
 * include API keys, service endpoints, and operational parameters.
 */
interface MeetingSchedulerConfig {
  /** Microsoft Graph API client ID for authentication */
  client_id?: string;
  /** Microsoft Graph API client secret for authentication */
  client_secret?: string;
  /** Microsoft Azure tenant ID */
  tenant_id?: string;
  /** User ID or email for meeting creation (when using application permissions) */
  user_id?: string;
}

/**
 * Main tool instance created using the AI Spine createTool factory.
 * This tool implements the universal AI Spine contract, making it compatible
 * with all AI Spine platforms and runtimes.
 */
const meetingSchedulerTool = createTool<MeetingSchedulerInput, MeetingSchedulerConfig>({
  /**
   * Tool metadata provides information about the tool's identity,
   * capabilities, and usage. This information is used for documentation
   * generation, tool discovery, and runtime introspection.
   */
  metadata: {
    name: 'meeting-scheduler',
    version: '1.0.0',
    description: 'Schedules meetings through Microsoft Teams using Microsoft Graph API',
    capabilities: ['meeting-scheduling', 'teams-integration', 'calendar-management'],
    author: 'AI Spine Developer',
    license: 'MIT',
  },

  /**
   * Schema definition describes the structure and validation rules for
   * both input data and configuration. The AI Spine framework uses this
   * schema to automatically validate inputs, generate documentation,
   * and provide type safety.
   */
  schema: {
    /**
     * Input schema defines the fields that users can provide when
     * executing this tool. Each field includes validation rules,
     * descriptions, and default values.
     */
    input: {
      subject: stringField({
        required: true,
        description: 'Subject/title of the meeting',
        minLength: 1,
        maxLength: 255,
      }),
      startDateTime: stringField({
        required: true,
        description: 'Start date and time in ISO format (e.g., 2025-09-03T14:30:00Z)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
      }),
      endDateTime: stringField({
        required: true,
        description: 'End date and time in ISO format (e.g., 2025-09-03T15:30:00Z)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
      }),
      attendees: {
        type: 'array',
        required: false,
        description: 'List of attendee email addresses',
        items: {
          type: 'string',
          required: false,
          description: 'Attendee email address',
          pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$',
        },
        maxItems: 50,
      },
      description: stringField({
        required: false,
        description: 'Optional meeting description',
        maxLength: 1000,
      }),
      allowCamera: booleanField({
        required: false,
        description: 'Whether to allow attendees to enable camera',
        default: true,
      }),
      allowMicrophone: booleanField({
        required: false,
        description: 'Whether to allow attendees to enable microphone',
        default: true,
      }),
      allowRecording: booleanField({
        required: false,
        description: 'Whether to allow meeting recording',
        default: false,
      }),
    },

    /**
     * Configuration schema defines settings that can be provided via
     * environment variables or configuration files. These are typically
     * used for API keys, service endpoints, and operational parameters.
     */
    config: {
      client_id: apiKeyField({
        required: true,
        description: 'Microsoft Graph API client ID for authentication',
      }),
      client_secret: apiKeyField({
        required: true,
        description: 'Microsoft Graph API client secret for authentication',
      }),
      tenant_id: {
        type: 'string',
        required: true,
        description: 'Microsoft Azure tenant ID',
      },
      user_id: {
        type: 'string',
        required: false,
        description: 'User ID or email for meeting creation (when using application permissions)',
      },
    },
  },

  /**
   * The execute function contains the main business logic of the tool.
   * It receives validated input data, configuration, and execution context,
   * then performs the requested operation and returns structured results.
   * 
   * @param input - Validated input data matching the input schema
   * @param config - Configuration settings from environment/config files  
   * @param context - Execution context with metadata and tracking information
   * @returns Promise resolving to structured execution results
   */
  async execute(input, config, context) {
    console.log(`Executing meeting-scheduler tool with execution ID: ${context.executionId}`);
    console.log(`Creating Teams meeting: "${input.subject}" from ${input.startDateTime} to ${input.endDateTime}`);

    try {
      // Validate required configuration
      if (!config.client_id || !config.client_secret || !config.tenant_id) {
        throw new Error('Missing required Microsoft Graph API configuration: client_id, client_secret, and tenant_id are required');
      }

      // Validate meeting times
      const startTime = new Date(input.startDateTime);
      const endTime = new Date(input.endDateTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error('Invalid date format. Please use ISO format (e.g., 2025-09-03T14:30:00Z)');
      }

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      // Check if meeting is in the past
      if (startTime < new Date()) {
        throw new Error('Cannot schedule meetings in the past');
      }

      // Initialize Microsoft Graph client
      const graphClient = new MicrosoftGraphClient(
        config.client_id,
        config.client_secret,
        config.tenant_id
      );

      // Create the Teams meeting
      const meetingResult = await graphClient.createMeeting({
        subject: input.subject,
        startDateTime: input.startDateTime,
        endDateTime: input.endDateTime,
        ...(input.attendees && { attendees: input.attendees }),
        ...(input.description && { description: input.description }),
        ...(input.allowCamera !== undefined && { allowCamera: input.allowCamera }),
        ...(input.allowMicrophone !== undefined && { allowMicrophone: input.allowMicrophone }),
        ...(input.allowRecording !== undefined && { allowRecording: input.allowRecording }),
      }, config.user_id);

      // Format the response with useful meeting information
      const meetingInfo = {
        meeting_id: meetingResult.id,
        join_url: meetingResult.joinUrl,
        conference_id: meetingResult.audioConferencing?.conferenceId,
        dial_in_url: meetingResult.audioConferencing?.dialinUrl,
        subject: meetingResult.subject,
        start_time: meetingResult.startDateTime,
        end_time: meetingResult.endDateTime,
        created_at: meetingResult.creationDateTime,
        organizer: meetingResult.organizer?.user?.displayName,
        settings: {
          allow_camera: meetingResult.allowAttendeeToEnableCamera,
          allow_microphone: meetingResult.allowAttendeeToEnableMic,
          allow_recording: meetingResult.allowRecording,
          chat_enabled: meetingResult.allowMeetingChat === 'enabled',
        },
      };

      // Return structured results following AI Spine conventions
      return {
        status: 'success',
        data: {
          meeting: meetingInfo,
          summary: `Successfully created Teams meeting "${input.subject}" for ${input.startDateTime}`,
          attendees_count: input.attendees?.length || 0,
          instructions: [
            'Share the join URL with attendees to join the meeting',
            'Meeting will be available 15 minutes before the start time',
            input.allowRecording ? 'Recording is enabled for this meeting' : 'Recording is disabled for this meeting',
          ],
          metadata: {
            execution_id: context.executionId,
            timestamp: context.timestamp.toISOString(),
            tool_version: '1.0.0',
            provider: 'Microsoft Teams via Graph API',
          },
        },
      };
    } catch (error) {
      console.error('Error creating Teams meeting:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Authentication failed')) {
        errorMessage += ' - Please verify your Microsoft Graph API credentials';
      } else if (errorMessage.includes('Meeting creation failed')) {
        errorMessage += ' - Please check if the user has required permissions';
      }
      
      throw new Error(`Failed to create Teams meeting: ${errorMessage}`);
    }
  },
});

/**
 * Main entry point that starts the tool server with configurable options.
 * The server exposes REST endpoints that comply with the AI Spine universal contract:
 * - GET /health - Health check and tool metadata
 * - POST /execute - Execute the tool with input data
 * - GET /schema - Tool schema and documentation
 * 
 * Configuration is loaded from environment variables, allowing for flexible
 * deployment across different environments.
 */
async function main() {
  try {
    await meetingSchedulerTool.start({
      // Server configuration from environment variables with sensible defaults
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: process.env.HOST || '0.0.0.0',
      
      // Development features for easier debugging and testing
      development: {
        requestLogging: process.env.NODE_ENV === 'development'
      },
      
      // Security configuration for production deployments
      security: {
        requireAuth: process.env.API_KEY_AUTH === 'true',
        ...(process.env.VALID_API_KEYS && { apiKeys: process.env.VALID_API_KEYS.split(',') }),
      },
    });
    
    console.log(`🚀 MeetingScheduler tool server started successfully`);
    console.log(`📡 Listening on port ${process.env.PORT || 3000}`);
    console.log(`🔗 Health check: http://localhost:${process.env.PORT || 3000}/health`);
  } catch (error) {
    console.error('Failed to start tool server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handlers ensure the tool server stops cleanly when
 * receiving termination signals. This is important for:
 * - Completing ongoing requests
 * - Cleaning up resources
 * - Proper logging and monitoring
 * - Container orchestration compatibility
 */

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  await meetingSchedulerTool.stop();
  process.exit(0);
});

// Handle SIGTERM (container/process manager termination) for graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  await meetingSchedulerTool.stop();
  process.exit(0);
});

// Start the server if this file is run directly (not when imported as a module)
if (require.main === module) {
  main();
}

/**
 * Export the tool instance for use in tests, other modules, or programmatic usage.
 * This allows the tool to be imported and used without starting the HTTP server.
 */
export default meetingSchedulerTool;