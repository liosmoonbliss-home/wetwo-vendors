// =====================================================================
// ASSISTANT LOGGING — Add this to src/app/dashboard/assistant/route.ts
// =====================================================================
//
// This adds two capabilities:
// 1. Every vendor question + Claude response gets logged to Supabase
// 2. Claude auto-categorizes the question so you can filter/analyze
//
// INSTRUCTIONS:
// 1. Add the logAssistantConversation function below to the file
// 2. In the POST handler, after you get the Claude response, call it
// 3. The logging is fire-and-forget (won't slow down the response)
// =====================================================================

// --- ADD THIS FUNCTION ---

async function logAssistantConversation({
  vendorRef,
  vendorName,
  vendorId,
  question,
  response,
}: {
  vendorRef?: string;
  vendorName?: string;
  vendorId?: string;
  question: string;
  response: string;
}) {
  // Auto-categorize the question
  const q = question.toLowerCase();
  let category = 'other';
  if (q.includes('start') || q.includes('first') || q.includes('begin') || q.includes('how do i') || q.includes('getting started')) {
    category = 'getting_started';
  } else if (q.includes('upgrade') || q.includes('plan') || q.includes('sponsor') || q.includes('subscription') || q.includes('pricing') || q.includes('pay')) {
    category = 'upgrade';
  } else if (q.includes('link') || q.includes('share') || q.includes('referral') || q.includes('url') || q.includes('qr')) {
    category = 'links';
  } else if (q.includes('commission') || q.includes('earn') || q.includes('money') || q.includes('income') || q.includes('cashback') || q.includes('revenue')) {
    category = 'commission';
  } else if (q.includes('bug') || q.includes('error') || q.includes('broken') || q.includes('not working') || q.includes('help') || q.includes('issue')) {
    category = 'technical';
  } else if (q.includes('couple') || q.includes('bride') || q.includes('wedding') || q.includes('registry')) {
    category = 'couples';
  }

  try {
    // Fire-and-forget — don't await in the main response flow
    fetch(new URL('/api/assistant-log', process.env.NEXT_PUBLIC_SITE_URL || 'https://wetwo-vendors.vercel.app').toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_ref: vendorRef,
        vendor_name: vendorName,
        vendor_id: vendorId,
        question,
        response: response.substring(0, 2000),
        category,
      }),
    }).catch(() => {}); // Swallow errors — logging should never break chat
  } catch {
    // Silent fail
  }
}

// --- THEN IN YOUR POST HANDLER, after getting Claude's response, add: ---
//
// Example (adjust to match your existing code structure):
//
//   const assistantMessage = data.content[0].text;
//
//   // Log the conversation (fire-and-forget)
//   const vendorSession = JSON.parse(body.vendorSession || '{}');
//   logAssistantConversation({
//     vendorRef: vendorSession.ref,
//     vendorName: vendorSession.business_name,
//     vendorId: vendorSession.id,
//     question: userMessage,       // the user's latest message
//     response: assistantMessage,   // Claude's response
//   });
//
//   return NextResponse.json({ message: assistantMessage });


// =====================================================================
// DAILY DIGEST (Optional) — Add to a cron job or Vercel cron
// =====================================================================
// If you want a daily email digest of what vendors are asking Claude,
// create a cron route at /api/cron/assistant-digest/route.ts:
//
// It queries assistant_conversations from the last 24 hours,
// groups by category, and sends you a summary email.
// =====================================================================

export {}; // Make this a module
