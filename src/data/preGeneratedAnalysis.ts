import type { AnalysisRecord, EvidencePassage, RouteCategory } from '@/types'

export interface PreGeneratedItem {
  record_ref: string;
  source_type: 'call' | 'meeting';
  source_id: string;
  analysis_source_revision: number;
  summary: string;
  why_it_matters: string;
  evidence_passages: EvidencePassage[];
  next_action: string;
  action_owner: string | null;
  uncertainties: string[];
  suggested_routes: RouteCategory[];
  route_rationale: string;
}

export const PRE_GENERATED_ANALYSES: Record<string, PreGeneratedItem> = {
  // --- CALLS ---
  // C01
  'call:0d970e7e-3945-5c1a-b6b8-a0e28fcf9a45': {
    record_ref: 'C01',
    source_type: 'call',
    source_id: '0d970e7e-3945-5c1a-b6b8-a0e28fcf9a45',
    analysis_source_revision: 1,
    summary: 'Prospect showed initial resistance to cold outreach but asked what the company does and agreed to receive an introductory overview via email.',
    why_it_matters: 'Classic objection handling scenario. Initial pushback turned into mild curiosity; rep needs coaching on immediate hook, and email must be sent promptly.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C01',
        source_id: '0d970e7e-3945-5c1a-b6b8-a0e28fcf9a45',
        quote: "I didn't ask for this call, and I'm not interested... just briefly, what does your company actually do?",
      },
      {
        type: 'call-quote',
        record_ref: 'C01',
        source_id: '0d970e7e-3945-5c1a-b6b8-a0e28fcf9a45',
        quote: "You can send an introductory email with high-level details, but don't schedule a follow-up call right away.",
      }
    ],
    next_action: 'Send brief product overview email focusing on expense automation; do not cold call immediately.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Prospect company name and tech stack unknown',
      'True intent unclear: polite brush-off vs genuine future evaluation',
      'Decision-maker authority not established'
    ],
    suggested_routes: ['sales-coaching', 'human-review'],
    route_rationale: 'Review rep cold call objection handling and review whether this lead qualifies for SDR nurturing or should be marked unresponsive.',
  },

  // C02
  'call:54ab9370-96f7-53bc-91ca-71a7629b359c': {
    record_ref: 'C02',
    source_type: 'call',
    source_id: '54ab9370-96f7-53bc-91ca-71a7629b359c',
    analysis_source_revision: 1,
    summary: 'Executive assistant intercepted call; stated director is in quarterly budgeting and requested a formal email proposal before any calendar booking.',
    why_it_matters: 'Gatekeeper pattern. Direct dials are blocked during budget cycle, but executive office provided a direct route for written materials.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C02',
        source_id: '54ab9370-96f7-53bc-91ca-71a7629b359c',
        quote: 'Mr. Verma is in quarterly planning. He does not take unscheduled vendor calls. If you send a two-pager by email, I will place it in his review folder.',
      }
    ],
    next_action: 'Draft two-page executive summary tailored to enterprise spend controls and email to the provided address.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Whether the assistant will actually present the materials',
      'Current vendor contracts or renewal timelines unknown',
      'Budget allocation size unknown'
    ],
    suggested_routes: ['sales-coaching'],
    route_rationale: 'Coaching on gatekeeper navigation and crafting concise executive collateral rather than generic pitch decks.',
  },

  // C03
  'call:0665ad57-0a4f-56bb-9f68-7b9c6691461d': {
    record_ref: 'C03',
    source_type: 'call',
    source_id: '0665ad57-0a4f-56bb-9f68-7b9c6691461d',
    analysis_source_revision: 1,
    summary: 'Technical lead showed strong interest in API integration for automated reconciliation; requested webhook documentation and scheduled a Monday follow-up call.',
    why_it_matters: 'High-intent technical qualification. Customer specifically identified webhook/event notification needs for their internal ERP integration.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C03',
        source_id: '0665ad57-0a4f-56bb-9f68-7b9c6691461d',
        quote: "Could we do this by email? Or call on Monday... Something like 'Developer access and event notifications — follow-up'",
      },
      {
        type: 'call-quote',
        record_ref: 'C03',
        source_id: '0665ad57-0a4f-56bb-9f68-7b9c6691461d',
        quote: 'We need real-time webhooks when an expense is submitted so our custom backend stays in sync.',
      }
    ],
    next_action: 'Email API sandbox access and webhook specs; confirm calendar invite for Monday at 11:00 AM IST.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Internal timeline for ERP rollout not fully confirmed',
      'Commercial budget authorization not discussed'
    ],
    suggested_routes: ['deal-next-steps'],
    route_rationale: 'Direct pipeline progression. Technical evaluation underway with agreed next meeting date.',
  },

  // C04
  'call:271295fc-1b44-59e5-b1a7-4b71fe112d83': {
    record_ref: 'C04',
    source_type: 'call',
    source_id: '271295fc-1b44-59e5-b1a7-4b71fe112d83',
    analysis_source_revision: 1,
    summary: 'Prospect raised budget freeze objection and noted they renewed a competitor contract 3 months ago; open to re-evaluating in Q1 next year.',
    why_it_matters: 'Identifies competitor incumbent and contract cycle. No immediate deal, but clear trigger event for future nurture pipeline.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C04',
        source_id: '271295fc-1b44-59e5-b1a7-4b71fe112d83',
        quote: 'We locked in our annual contract with Expensify three months ago. We have zero software budget until Q1.',
      }
    ],
    next_action: 'Log contract expiry date in CRM for mid-November nurture trigger; send value comparison whitepaper.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Early termination penalty on existing contract unknown',
      'Exact seat count and contract value unknown'
    ],
    suggested_routes: ['deal-next-steps', 'sales-coaching'],
    route_rationale: 'Set CRM reminder for contract renewal cycle, and coach rep on timing objections.',
  },

  // C05
  'call:6e632824-e2aa-5942-8ef7-0efcba6cbcae': {
    record_ref: 'C05',
    source_type: 'call',
    source_id: '6e632824-e2aa-5942-8ef7-0efcba6cbcae',
    analysis_source_revision: 1,
    summary: 'Customer expressed frustration over delayed invoice generation and unexpected setup charge; demanded manager callback to correct invoice.',
    why_it_matters: 'Urgent churn/satisfaction risk. Existing client feeling misled on onboarding pricing and invoice reconciliation.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C05',
        source_id: '6e632824-e2aa-5942-8ef7-0efcba6cbcae',
        quote: 'We were told setup was included, but now I see a separate line item of INR 13,000 plus GST that was never agreed upon.',
      }
    ],
    next_action: 'Sales manager or billing support must call customer within 2 hours to review invoice breakdown and issue credit note if promised.',
    action_owner: 'Billing Operations / Account Manager',
    uncertainties: [
      'Whether the original quote email included setup waiver or not',
      'Customer contract signed version not verified on call'
    ],
    suggested_routes: ['customer-follow-up', 'human-review'],
    route_rationale: 'Disputed billing charges require immediate account management intervention and audit of original deal terms.',
  },

  // C06
  'call:a5ee9047-b765-50fa-a253-e52290f6eb94': {
    record_ref: 'C06',
    source_type: 'call',
    source_id: 'a5ee9047-b765-50fa-a253-e52290f6eb94',
    analysis_source_revision: 1,
    summary: 'Prospect evaluating corporate prepaid cards for 25 field sales representatives; asked about physical vs virtual delivery and daily spending limits.',
    why_it_matters: 'High-priority qualified opportunity. Clear user count (25 reps), specific operational use-case (field travel and meals).',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C06',
        source_id: 'a5ee9047-b765-50fa-a253-e52290f6eb94',
        quote: 'We have 25 sales reps travelling across western region. They are currently paying out of pocket and complaining about reimbursement lag.',
      }
    ],
    next_action: 'Send corporate card proposal for 25 users with tiered wallet pricing and schedule live demo for Friday.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Total estimated monthly spend volume across the 25 cards',
      'Whether physical card issuance requires KYC courier'
    ],
    suggested_routes: ['deal-next-steps'],
    route_rationale: 'Active deal pipeline progression for mid-market corporate card issuance.',
  },

  // C07
  'call:bfeb1f64-d698-5c45-814c-473d9cecae65': {
    record_ref: 'C07',
    source_type: 'call',
    source_id: 'bfeb1f64-d698-5c45-814c-473d9cecae65',
    analysis_source_revision: 1,
    summary: 'Caller is a regional accounting and IT consultancy seeking a partner/reseller agreement to distribute SpendNest to their SME client base.',
    why_it_matters: 'Channel partnership opportunity, NOT a direct end-user sale. Could yield multi-tenant distribution if routed to partnerships team.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C07',
        source_id: 'bfeb1f64-d698-5c45-814c-473d9cecae65',
        quote: "I wanted to ask about a possible partnership... Send whatever proposal you have... could I call on Monday to see whether you'd like to discuss it further?",
      }
    ],
    next_action: 'Forward contact details to Head of Partnerships; share agency partner agreement template and revenue-share schedule.',
    action_owner: 'Partnerships Lead',
    uncertainties: [
      'Number of active SME clients in partner portfolio',
      'Whether they require white-labeling or referral commission'
    ],
    suggested_routes: ['partnership-follow-up'],
    route_rationale: 'Must not be handled as a standard direct sales lead. Belongs in Partnership / Channel channel.',
  },

  // C08
  'call:1aa0c9e0-f04c-535d-9783-cf2ce698d234': {
    record_ref: 'C08',
    source_type: 'call',
    source_id: '1aa0c9e0-f04c-535d-9783-cf2ce698d234',
    analysis_source_revision: 1,
    summary: 'Existing customer called inquiring about release date for Tally accounting sync feature promised during onboarding.',
    why_it_matters: 'Feature promise accountability. Customer adoption and satisfaction depend on upcoming accounting connector.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C08',
        source_id: '1aa0c9e0-f04c-535d-9783-cf2ce698d234',
        quote: 'We were told Tally direct sync would be live by mid-August. Our accountant is still manually re-entering records every Friday.',
      }
    ],
    next_action: 'Check product release roadmap with engineering team and provide customer with exact beta rollout date.',
    action_owner: 'Customer Success / Product Manager',
    uncertainties: [
      'Exact Tally version installed at customer site (Tally Prime vs ERP 9)',
      'Engineering sprint release timeline'
    ],
    suggested_routes: ['customer-follow-up'],
    route_rationale: 'Product expectation alignment and customer retention follow-up.',
  },

  // C09
  'call:d894b9fb-195f-553b-ad03-2486c7577589': {
    record_ref: 'C09',
    source_type: 'call',
    source_id: 'd894b9fb-195f-553b-ad03-2486c7577589',
    analysis_source_revision: 1,
    summary: 'Enterprise procurement officer called to inform that vendor security assessment (SOC 2, ISO 27001) must be submitted before demo can proceed.',
    why_it_matters: 'Strict enterprise compliance hurdle. Deal is stalled until info-sec questionnaire is completed.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C09',
        source_id: 'd894b9fb-195f-553b-ad03-2486c7577589',
        quote: 'Our risk team requires your SOC 2 Type II compliance pack and data residency verification before we can invite the finance VP to a demo.',
      }
    ],
    next_action: 'Dispatch standard Security & Compliance package (SOC 2 summary, ISO certs, AWS Mumbai data residency letter).',
    action_owner: 'Solutions Architect / Security Lead',
    uncertainties: [
      'Specific questionnaire format required by enterprise procurement',
      'Timeline for procurement committee review cycle'
    ],
    suggested_routes: ['deal-next-steps', 'human-review'],
    route_rationale: 'Standard sales rep cannot answer enterprise security criteria alone; requires managerial/technical oversight.',
  },

  // C10
  'call:f784d142-ff0f-5ce2-901b-c7be93d406a1': {
    record_ref: 'C10',
    source_type: 'call',
    source_id: 'f784d142-ff0f-5ce2-901b-c7be93d406a1',
    analysis_source_revision: 1,
    summary: 'Previous prospect re-opened conversation after internal restructuring; requested updated pricing sheet and modular breakdown.',
    why_it_matters: 'Re-activated dormant pipeline opportunity. New management wants fresh evaluation.',
    evidence_passages: [
      {
        type: 'call-quote',
        record_ref: 'C10',
        source_id: 'f784d142-ff0f-5ce2-901b-c7be93d406a1',
        quote: 'Our leadership changed last month and corporate expense tracking is back on top of the priorities list. Send me your current pricing schedule.',
      }
    ],
    next_action: 'Send refreshed modular pricing sheet and invite prospect to a 20-minute re-engagement walkthrough.',
    action_owner: 'Kiran Rao (Call Rep)',
    uncertainties: [
      'Who the new VP/CFO decision maker is',
      'Whether previous requirements or user counts have changed'
    ],
    suggested_routes: ['deal-next-steps'],
    route_rationale: 'Active deal re-engagement with strong buying intent.',
  },

  // --- MEETINGS ---
  // M01
  'meeting:f3a3c9eb-b5aa-5437-9750-6a2e998e3b75': {
    record_ref: 'M01',
    source_type: 'meeting',
    source_id: 'f3a3c9eb-b5aa-5437-9750-6a2e998e3b75',
    analysis_source_revision: 1,
    summary: 'Detailed product demonstration covering multi-entity spend controls, department budget limits, and approval hierarchies with finance team.',
    why_it_matters: 'In-depth qualification. Prospect showed active engagement on subsidiary budget controls and asked specific questions on approval routing.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M01',
        source_id: 'f3a3c9eb-b5aa-5437-9750-6a2e998e3b75',
        turn_number: 14,
        timecode: '00:15:30',
        speaker: 'Customer A',
        text: 'Can a subsidiary finance manager approve expenses for their branch without having visibility into the parent company accounts?',
      }
    ],
    next_action: 'Provide multi-entity configuration guide and draft proposal for 3 operating entities.',
    action_owner: 'Account Executive',
    uncertainties: [
      'Estimated total transaction volume across all three entities',
      'Target go-live date not explicitly stated'
    ],
    suggested_routes: ['deal-next-steps'],
    route_rationale: 'Core deal progression for multi-entity enterprise deal.',
  },

  // M02
  'meeting:2b5ec9eb-17bb-5896-bc72-87ba42a420b9': {
    record_ref: 'M02',
    source_type: 'meeting',
    source_id: '2b5ec9eb-17bb-5896-bc72-87ba42a420b9',
    analysis_source_revision: 1,
    summary: 'Commercial negotiation call where customer procurement demanded pricing proposal in writing before scheduling management call, while rep insisted on walkthrough.',
    why_it_matters: 'Sales methodology friction. Prospect explicitly stated their four-step evaluation process requires written pricing first; rep pushing for call created pushback.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M02',
        source_id: '2b5ec9eb-17bb-5896-bc72-87ba42a420b9',
        turn_number: 15,
        timecode: '00:48:33',
        speaker: 'Team member A',
        text: 'Our evaluation goes through product fit, the business reason, commercials, then references and support checks. Written pricing helps us follow that process internally.',
      }
    ],
    next_action: 'Send comprehensive written pricing template to accommodate their procurement process, then schedule short alignment call.',
    action_owner: 'Sales Lead',
    uncertainties: [
      'Who the final management signing authority is',
      'Which pricing tier fits their transaction volume'
    ],
    suggested_routes: ['deal-next-steps', 'sales-coaching'],
    route_rationale: 'Coach rep on respecting buyer procurement governance rather than forcing rigid sales call scripts.',
  },

  // M03
  'meeting:398672e7-62dd-5afd-846d-0237d49792fb': {
    record_ref: 'M03',
    source_type: 'meeting',
    source_id: '398672e7-62dd-5afd-846d-0237d49792fb',
    analysis_source_revision: 1,
    summary: 'Asterloom Systems discussion regarding domestic prepaid cards (INR 10-13 lakh monthly spend). Customer surprised cards are prepaid, questioned setup fee (INR 26k vs 39k), and noted CFO must approve.',
    why_it_matters: 'Key commercial clarification needed. Customer confused between prepaid and corporate credit cards; fee explanation (INR 26k subscription + INR 13k setup) addressed on call.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M03',
        source_id: '398672e7-62dd-5afd-846d-0237d49792fb',
        turn_number: 8,
        timecode: '00:11:04',
        speaker: 'Customer A',
        text: 'Wait, these are prepaid? I had thought about a corporate credit card. So we put money in before anyone spends, and there is no credit facility on these domestic cards?',
      },
      {
        type: 'meeting-turn',
        record_ref: 'M03',
        source_id: '398672e7-62dd-5afd-846d-0237d49792fb',
        turn_number: 22,
        timecode: '00:30:41',
        speaker: 'Customer A',
        text: 'But you previously told me INR 26,000. Why has that become INR 39,000?',
      }
    ],
    next_action: 'Send clear written cards proposal breaking down INR 26,000 subscription vs INR 13,000 one-time integration setup; allow time for CFO discussion.',
    action_owner: 'Sales Representative (Team member A)',
    uncertainties: [
      'CFO approval likelihood and internal timeline',
      'Whether they will pilot with 4-5 employees first or wait'
    ],
    suggested_routes: ['deal-next-steps', 'sales-coaching'],
    route_rationale: 'Deal follow-up with pricing clarity and coaching on transparent quoting.',
  },

  // M04
  'meeting:b0f79b3d-37ba-52f9-b2bc-58b159dd6d91': {
    record_ref: 'M04',
    source_type: 'meeting',
    source_id: 'b0f79b3d-37ba-52f9-b2bc-58b159dd6d91',
    analysis_source_revision: 1,
    summary: 'Cedarwave Distribution migration review: existing card programme closing, client exploring bank corporate credit line feed (INR 1.3 crore line) alongside prepaid cards.',
    why_it_matters: 'Customer retention and product transition. Client has INR 1.3 Cr bank credit facility and needs to know if SpendNest software can reconcile bank-issued cards.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M04',
        source_id: 'b0f79b3d-37ba-52f9-b2bc-58b159dd6d91',
        turn_number: 16,
        timecode: '00:24:32',
        speaker: 'Customer B',
        text: 'We already have a corporate credit line of about INR 1.3 crore... If your platform can sit in between, we should understand that route.',
      }
    ],
    next_action: 'Check with programme team whether existing bank cards can join transaction feed programme; schedule user migration assistance session.',
    action_owner: 'Programme Team / Implementation Specialist',
    uncertainties: [
      'Bank card programme technical eligibility',
      'Accounting integration support for settlement feeds'
    ],
    suggested_routes: ['customer-follow-up', 'deal-next-steps'],
    route_rationale: 'Customer account migration requiring technical validation and implementation guidance.',
  },

  // M06
  'meeting:657b9e9d-9472-5b01-a127-a648ad7e8cf7': {
    record_ref: 'M06',
    source_type: 'meeting',
    source_id: '657b9e9d-9472-5b01-a127-a648ad7e8cf7',
    analysis_source_revision: 1,
    summary: 'Mapletrail Services receivables automation discussion. Local finance manager handles 8 clients (company overall sends 390-520 invoices/month); concerned about data confidentiality.',
    why_it_matters: 'Large potential enterprise footprint (65 finance staff centrally, 390-520 monthly invoices). Rep pitched automated receivables chaser.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M06',
        source_id: '657b9e9d-9472-5b01-a127-a648ad7e8cf7',
        turn_number: 13,
        timecode: '00:15:09',
        speaker: 'Customer A',
        text: 'Several for each customer, each month... Approximately [390-520 a month]. The value is the bigger point, and many are in foreign currency.',
      },
      {
        type: 'meeting-turn',
        record_ref: 'M06',
        source_id: '657b9e9d-9472-5b01-a127-a648ad7e8cf7',
        turn_number: 21,
        timecode: '00:34:27',
        speaker: 'Customer A',
        text: 'Confidentiality is important. Payment information is sensitive. How is that protected, and is there a risk of somebody interfering with it?',
      }
    ],
    next_action: 'Send product collateral for both receivables automation and expense cards, along with security & confidentiality certifications.',
    action_owner: 'Sales Representative (Team member A)',
    uncertainties: [
      'Whether central finance team will participate in a demo',
      'Integration compatibility with their proprietary ERP'
    ],
    suggested_routes: ['deal-next-steps'],
    route_rationale: 'Enterprise deal qualification for receivables automation.',
  },

  // M07 (Will be supplied in update revision 2)
  'meeting:4f304fff-fd40-5cfc-a366-0a134c445c2a': {
    record_ref: 'M07',
    source_type: 'meeting',
    source_id: '4f304fff-fd40-5cfc-a366-0a134c445c2a',
    analysis_source_revision: 2,
    summary: 'Willowfield Trust discussion: Customer reviewed non-profit subscription discounts and audit trail compliance for grant spending.',
    why_it_matters: 'Late-arriving transcript from second batch. Highlights trust fund compliance requirements and custom fiscal year reporting.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M07',
        source_id: '4f304fff-fd40-5cfc-a366-0a134c445c2a',
        turn_number: 4,
        timecode: '00:08:15',
        speaker: 'Customer A',
        text: 'We are a non-profit trust; all grant funds must be tagged to specific donor projects for our statutory audit.',
      }
    ],
    next_action: 'Send non-profit pricing tier and donor project tag configuration documentation.',
    action_owner: 'Sales Lead (team09@example.com)',
    uncertainties: [
      'Donor grant disbursal schedule',
      'Trust board approval date'
    ],
    suggested_routes: ['deal-next-steps', 'human-review'],
    route_rationale: 'Special non-profit pricing requires sales leadership review.',
  },

  // M09
  'meeting:4b5b9192-f3fc-505a-8e77-4d2ffaa54594': {
    record_ref: 'M09',
    source_type: 'meeting',
    source_id: '4b5b9192-f3fc-505a-8e77-4d2ffaa54594',
    analysis_source_revision: 1,
    summary: 'Brookmint Holdings / Northkite Equipment onboarding troubleshooting: reset token expired, shared mailbox administrator role created security conflict, missing transaction receipts.',
    why_it_matters: 'Critical onboarding escalation. Customer cannot access Brookmint account due to expired token; concerned about AP clerk gaining admin rights via shared mailbox.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M09',
        source_id: '4b5b9192-f3fc-505a-8e77-4d2ffaa54594',
        turn_number: 14,
        timecode: '00:13:54',
        speaker: 'Customer A',
        text: 'It says the token has expired. This is the fresh message we just received.',
      },
      {
        type: 'meeting-turn',
        record_ref: 'M09',
        source_id: '4b5b9192-f3fc-505a-8e77-4d2ffaa54594',
        turn_number: 10,
        timecode: '00:09:34',
        speaker: 'Customer A',
        text: 'The accounts-payable officer already has an individual login. My concern is that they also have access to the shared mailbox, so their individual role does not stop them using the other identity.',
      }
    ],
    next_action: 'Fix expired token issue with engineering and advise customer on configuring separate admin identity rather than shared inbox.',
    action_owner: 'Technical Support / Team member A',
    uncertainties: [
      'Root cause of immediate token expiration (server clock drift vs mail scanner link consumption)',
      'IT policy on individual company email addresses'
    ],
    suggested_routes: ['customer-follow-up', 'human-review'],
    route_rationale: 'Active customer onboarding blocker requiring engineering bug investigation and manager review.',
  },

  // M10
  'meeting:337f297d-9385-5b82-9e54-5019c1ed912c': {
    record_ref: 'M10',
    source_type: 'meeting',
    source_id: '337f297d-9385-5b82-9e54-5019c1ed912c',
    analysis_source_revision: 1,
    summary: 'Internal billing operations training on invoice lifecycle: explains gap between invoice date and payment date, wallet deduction retry schedule (days 1, 3, 7, 10), and manual unfreeze procedure.',
    why_it_matters: 'Crucial internal knowledge transfer. Explains why revenue dates do not match invoice generation dates, and documents exact dunning policy.',
    evidence_passages: [
      {
        type: 'meeting-turn',
        record_ref: 'M10',
        source_id: '337f297d-9385-5b82-9e54-5019c1ed912c',
        turn_number: 11,
        timecode: '00:15:48',
        speaker: 'Team member A',
        text: 'Suppose the invoice is INR 6,240 but the wallet contains INR 6,110. The deduction fails and a notification goes out. The system tries three times... It repeats on the seventh day... On the tenth day... payments and cards can be blocked.',
      }
    ],
    next_action: 'Grant back-office super-admin demo access to Team member B and distribute standard operating procedure document.',
    action_owner: 'Team member A (Trainer)',
    uncertainties: [
      'Whether dunning notifications are automated via email or SMS',
      'Who receives account freeze alerts'
    ],
    suggested_routes: ['internal-vendor', 'sales-coaching'],
    route_rationale: 'Internal operational training session; useful for coaching new billing representatives and internal documentation.',
  },
}

export function getPreGeneratedAnalysis(
  sourceType: 'call' | 'meeting',
  sourceId: string,
  appliedRevision: number = 1
): AnalysisRecord | null {
  const key = `${sourceType}:${sourceId}`
  const item = PRE_GENERATED_ANALYSES[key]
  if (!item) return null

  // If source revision is higher than what analysis was generated against, mark stale!
  const isStale = appliedRevision > item.analysis_source_revision

  return {
    source_type: item.source_type,
    source_id: item.source_id,
    summary: item.summary,
    why_it_matters: item.why_it_matters,
    evidence_passages: item.evidence_passages,
    next_action: item.next_action,
    action_owner: item.action_owner,
    uncertainties: item.uncertainties,
    suggested_routes: item.suggested_routes,
    route_rationale: item.route_rationale,
    analysis_source_revision: item.analysis_source_revision,
    freshness: isStale ? 'stale' : 'current',
    is_pre_generated: true,
    generated_at: '2026-08-21T18:00:00Z',
    updated_at: '2026-08-21T18:00:00Z',
  }
}
