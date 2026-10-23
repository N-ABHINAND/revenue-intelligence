// ============================================================
// Revenue Intelligence Inbox — Core TypeScript Types
// ============================================================

// ---- Delivery Envelope ----

export interface DeliveryEnvelope {
  batch_id: string;
  revision: number;
  exported_at: string;
  records: SourceRecord[];
}

export interface SourceRecord {
  record_ref: string;
  source_type: 'call' | 'meeting';
  source_id: string;
  payload: CallPayload | MeetingPayload;
  transcript_payload: TranscriptPayload | null;
}

// ---- Call Payload ----

export interface CallPayload {
  id: string;
  external_call_id: string;
  workspace_slug: string;
  rep_email: string | null;
  rep_name: string | null;
  rep_user_id: string | null;
  direction: string;
  direction_raw: string;
  from_number: string | null;
  to_number: string | null;
  started_at: string;
  duration_seconds: number;
  talk_time_seconds: number | null;
  speaker_count: number | null;
  segment_count: number | null;
  is_connected: boolean | null;
  is_conversation: boolean | null;
  observed_outcome: string | null;
  classification_reason: null;
  classification_status: string | null;
  is_campaign_call: boolean | null;
  first_dial_ever: boolean | null;
  first_connect_ever: boolean | null;
  prior_dials_ever: number | null;
  prior_connects_ever: number | null;
  summary: null;
  summary_status: string | null;
  transcript: string | null;
}

// ---- Meeting Payload ----

export interface MeetingPayload {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  duration_seconds: number;
  provider: string;
  join_url: string;
  organizer_email: string | null;
  attendee_count: number | null;
  recording_status: string;
  recording_detail: string | null;
  recording_id: string | null;
  has_transcript: boolean;
  has_video: boolean;
  summary: null;
  summary_status: string | null;
  redacted: boolean;
}

// ---- Transcript Payload ----

export interface TranscriptPayload {
  meeting_id: string;
  turns: Turn[];
  unavailable_reason: string | null;
}

export interface Turn {
  speaker: string;
  starts_at_seconds: number;
  timecode: string;
  text: string;
}

// ============================================================
// Stored Database Records
// ============================================================

export type RouteCategory =
  | 'sales-coaching'
  | 'deal-next-steps'
  | 'customer-follow-up'
  | 'partnership-follow-up'
  | 'internal-vendor'
  | 'human-review'
  | 'insufficient-evidence';

export type ReviewStatus = 'pending' | 'reviewed' | 'needs-attention';
export type AnalysisFreshness = 'current' | 'stale' | 'pending-review' | 'not-generated';
export type RoutingMethod = 'suggested' | 'manual-override' | 'accepted-suggestion';
export type ProcessingState = 'complete' | 'no-text' | 'stale' | 'intake';

export interface StoredRecord {
  // Composite key
  source_type: 'call' | 'meeting';
  source_id: string;

  // From source
  record_ref: string;
  applied_revision: number;
  payload: CallPayload | MeetingPayload;
  transcript_payload: TranscriptPayload | null;

  // Import metadata
  imported_at: string;
  last_updated_at: string;

  // Computed
  has_usable_text: boolean;
  processing_state: ProcessingState;
}

export interface AnalysisRecord {
  source_type: 'call' | 'meeting';
  source_id: string;

  // Analysis content
  summary: string;
  why_it_matters: string;
  evidence_passages: EvidencePassage[];
  next_action: string;
  action_owner: string | null;
  uncertainties: string[];

  // Routing
  suggested_routes: RouteCategory[];
  route_rationale: string;

  // State
  analysis_source_revision: number;
  freshness: AnalysisFreshness;
  is_pre_generated: boolean;
  generated_at: string;
  updated_at: string;
}

export interface EvidencePassage {
  type: 'call-quote' | 'meeting-turn';
  record_ref: string;
  source_id: string;
  // For calls
  quote?: string;
  // For meetings
  turn_number?: number;
  timecode?: string;
  speaker?: string;
  text?: string;
}

export interface RoutingDecision {
  source_type: 'call' | 'meeting';
  source_id: string;

  // Suggested (from engine)
  suggested_routes: RouteCategory[];
  suggestion_rationale: string;

  // Effective (what's actually applied)
  effective_routes: RouteCategory[];
  routing_method: RoutingMethod;

  // Manual override
  is_manual_override: boolean;
  manual_routes: RouteCategory[] | null;
  manual_note: string | null;
  manual_override_at: string | null;

  // Review
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;

  last_updated_at: string;
}

export interface AuditEntry {
  id?: number;
  timestamp: string;
  action: AuditAction;
  source_type?: 'call' | 'meeting';
  source_id?: string;
  record_ref?: string;
  batch_id?: string;
  details: string;
  old_value?: string;
  new_value?: string;
}

export type AuditAction =
  | 'import-initial'
  | 'import-repeat'
  | 'import-update'
  | 'import-ignored'
  | 'import-validation-error'
  | 'route-manual-override'
  | 'route-reset'
  | 'route-accepted'
  | 'review-status-change'
  | 'analysis-refresh'
  | 'analysis-stale'
  | 'export-generated'
  | 'database-reset'
  | 'demo-loaded';

export interface ImportHistory {
  id?: number;
  batch_id: string;
  revision: number;
  exported_at: string;
  imported_at: string;
  new_count: number;
  updated_count: number;
  unchanged_count: number;
  ignored_count: number;
  error_count: number;
  total_records: number;
  errors: string[];
}

export interface ExportManifestEntry {
  source_type: 'call' | 'meeting';
  source_id: string;
  record_ref: string;
  applied_revision: number;
  suggested_routes: RouteCategory[];
  effective_routes: RouteCategory[];
  output_paths: string[];
  processing_state: ProcessingState;
  review_status: ReviewStatus;
  review_state?: ReviewStatus;
  is_manual_override: boolean;
  manual_override?: boolean;
  analysis_revision: number | null;
  analysis_freshness: AnalysisFreshness;
}

// ---- UI Display Types ----

export interface RecordSummaryRow {
  source_type: 'call' | 'meeting';
  source_id: string;
  record_ref: string;
  timestamp: string; // IST local time
  person: string | null; // rep_name or organizer_email
  title: string;
  has_usable_text: boolean;
  applied_revision: number;
  suggested_routes: RouteCategory[];
  effective_routes: RouteCategory[];
  review_status: ReviewStatus;
  is_manual_override: boolean;
  analysis_freshness: AnalysisFreshness;
  processing_state: ProcessingState;
  is_connected: boolean | null; // calls only
  observed_outcome: string | null;
}

export interface DashboardMetrics {
  total_records: number;
  call_count: number;
  meeting_count: number;
  usable_text_count: number;
  usable_call_text: number;
  usable_meeting_text: number;
  no_text_count: number;
  needs_review_count: number;
  stale_analysis_count: number;
  routing_counts: Record<RouteCategory, number>;
  // Connection rate (calls only)
  connected_calls: number;
  not_connected_calls: number;
  unknown_connection_calls: number;
  // Activity by person
  call_activity: PersonActivity[];
  meeting_activity: PersonActivity[];
}

export interface PersonActivity {
  person: string;
  count: number;
  usable_text_count: number;
  routing_summary: Partial<Record<RouteCategory, number>>;
}

export type FilterState = {
  source_type: 'all' | 'call' | 'meeting';
  person: string | null;
  suggested_route: RouteCategory | null;
  effective_route: RouteCategory | null;
  needs_review: boolean;
  has_text: boolean | null; // null = any, true = has text, false = no text
  is_manual_override: boolean;
  is_stale: boolean;
  search: string;
};
