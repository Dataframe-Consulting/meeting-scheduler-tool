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
declare const meetingSchedulerTool: import("@ai-spine/tools-core").Tool<MeetingSchedulerInput, MeetingSchedulerConfig>;
/**
 * Export the tool instance for use in tests, other modules, or programmatic usage.
 * This allows the tool to be imported and used without starting the HTTP server.
 */
export default meetingSchedulerTool;
//# sourceMappingURL=index.d.ts.map