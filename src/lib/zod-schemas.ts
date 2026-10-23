import { z } from 'zod'

export const CallPayloadSchema = z.object({
  id: z.string().uuid(),
  external_call_id: z.string(),
  workspace_slug: z.string(),
  rep_email: z.string().email().nullable(),
  rep_name: z.string().nullable(),
  rep_user_id: z.string().nullable(),
  direction: z.string(),
  direction_raw: z.string(),
  from_number: z.string().nullable(),
  to_number: z.string().nullable(),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  duration_seconds: z.number().int().nonnegative(),
  talk_time_seconds: z.number().int().nonnegative().nullable(),
  speaker_count: z.number().int().nonnegative().nullable(),
  segment_count: z.number().int().nonnegative().nullable(),
  is_connected: z.boolean().nullable(),
  is_conversation: z.boolean().nullable(),
  observed_outcome: z.string().nullable(),
  classification_reason: z.null(),
  classification_status: z.string().nullable(),
  is_campaign_call: z.boolean().nullable(),
  first_dial_ever: z.boolean().nullable(),
  first_connect_ever: z.boolean().nullable(),
  prior_dials_ever: z.number().int().nonnegative().nullable(),
  prior_connects_ever: z.number().int().nonnegative().nullable(),
  summary: z.null(),
  summary_status: z.string().nullable(),
  transcript: z.string().nullable(),
})

export const TurnSchema = z.object({
  speaker: z.string(),
  starts_at_seconds: z.number().nonnegative(),
  timecode: z.string(),
  text: z.string(),
})

export const TranscriptPayloadSchema = z.object({
  meeting_id: z.string().uuid(),
  turns: z.array(TurnSchema),
  unavailable_reason: z.string().nullable(),
})

export const MeetingPayloadSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  starts_at: z.string().datetime({ offset: true }).or(z.string()),
  ends_at: z.string().datetime({ offset: true }).or(z.string()),
  duration_seconds: z.number().int().nonnegative(),
  provider: z.string(),
  join_url: z.string().url(),
  organizer_email: z.string().email().nullable(),
  attendee_count: z.number().int().nonnegative().nullable(),
  recording_status: z.string(),
  recording_detail: z.string().nullable(),
  recording_id: z.string().uuid().nullable(),
  has_transcript: z.boolean(),
  has_video: z.boolean(),
  summary: z.null(),
  summary_status: z.string().nullable(),
  redacted: z.boolean(),
})

export const SourceRecordSchema = z.discriminatedUnion('source_type', [
  z.object({
    record_ref: z.string(),
    source_type: z.literal('call'),
    source_id: z.string().uuid(),
    payload: CallPayloadSchema,
    transcript_payload: z.null(),
  }),
  z.object({
    record_ref: z.string(),
    source_type: z.literal('meeting'),
    source_id: z.string().uuid(),
    payload: MeetingPayloadSchema,
    transcript_payload: TranscriptPayloadSchema.nullable(),
  }),
])

export const DeliveryEnvelopeSchema = z.object({
  batch_id: z.string(),
  revision: z.number().int().positive(),
  exported_at: z.string().datetime({ offset: true }).or(z.string()),
  records: z.array(SourceRecordSchema),
})

export type ValidatedDeliveryEnvelope = z.infer<typeof DeliveryEnvelopeSchema>
export type ValidatedSourceRecord = z.infer<typeof SourceRecordSchema>
