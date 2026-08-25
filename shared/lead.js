// Platform-agnostic lead handler. Knows nothing about Vercel, Cloudflare or
// Vite — it takes a parsed body plus an env object and returns a plain
// { status, body } pair. The thin adapters translate that to each runtime:
//
//   api/lead.js            → Vercel        (req, res)
//   functions/api/lead.js  → Cloudflare    (context) / Response
//   vite.config.js         → local dev     (connect middleware)
//
// Only web-standard APIs are used (fetch, AbortController, URLSearchParams) so
// the same code runs on Node and on the Workers runtime.
//
// Env keys (server-side only, never in the client bundle):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   — Telegram channel; skipped when unset
//   RESEND_API_KEY, LEAD_EMAIL_TO          — email channel; skipped when unset
//   LEAD_EMAIL_FROM                        — optional sender override
//   RECAPTCHA_SECRET                       — optional; skipped when unset
//
// At least one delivery channel must be configured. A lead counts as delivered
// if any configured channel accepts it.

const RECAPTCHA_TIMEOUT_MS = 4000
const TELEGRAM_TIMEOUT_MS = 8000
const EMAIL_TIMEOUT_MS = 8000
// Mobile devices routinely score 0.3–0.5, so anything higher rejects real leads.
const MIN_SCORE = 0.3

const LIMITS = {
  name: 120,
  phone: 60,
  email: 160,
  postal: 10,
  message: 2000,
  utm: 200,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]

/** Telegram parses our message as HTML — unescaped input would break it. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Same, plus quotes — safe to drop inside an href="…". */
function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

/** Makes the lead one tap to answer from Telegram. */
function phoneLinks(phone) {
  const digits = phone.replace(/\D/g, '')
  const shown = escapeHtml(phone)
  if (!digits) return shown
  return `<a href="tel:+${digits}">${shown}</a> · <a href="https://wa.me/${digits}">WhatsApp</a>`
}

function field(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

async function postWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * @param {object}  input
 * @param {object}  input.body  parsed JSON request body
 * @param {object}  input.env   process.env on Node, context.env on Cloudflare
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function handleLead({ body = {}, env = {} }) {
  // Honeypot: real users never fill a hidden field. Answer 200 so bots do not
  // learn they were caught, but drop the submission.
  if (field(body.website, 50)) {
    return { status: 200, body: { success: true } }
  }

  const name = field(body.name, LIMITS.name)
  const phone = field(body.phone, LIMITS.phone)
  const email = field(body.email, LIMITS.email)
  const postal = field(body.postal_code, LIMITS.postal)
  const message = field(body.message, LIMITS.message)

  if (!name || !phone || !email || !postal) {
    return { status: 400, body: { message: 'Missing required fields' } }
  }

  // Re-check the formats server-side; the client validation is only UX.
  if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
    return { status: 400, body: { message: 'Invalid phone number' } }
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 400, body: { message: 'Invalid email address' } }
  }
  if (!POSTAL_RE.test(postal)) {
    return { status: 400, body: { message: 'Invalid postal code' } }
  }

  // reCAPTCHA v3 — optional: skip when the token or the secret is absent.
  if (env.RECAPTCHA_SECRET && body.recaptchaToken) {
    try {
      const verification = await postWithTimeout(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: env.RECAPTCHA_SECRET,
            response: body.recaptchaToken,
          }),
        },
        RECAPTCHA_TIMEOUT_MS
      )
      const result = await verification.json()

      // Only a *scored* verdict is allowed to reject a lead. success:false
      // means the check could not be made at all — an unregistered domain, a
      // mismatched key pair, an expired or reused token. Blocking on that turns
      // one console misconfiguration into "every enquiry silently disappears",
      // and it buys nothing: a bot can already skip the token entirely, which
      // lands on the no-token path above. The honeypot and field validation
      // still apply either way.
      if (result.success === false) {
        console.warn(
          '[lead] reCAPTCHA could not verify, letting the lead through:',
          (result['error-codes'] || []).join(', ') || 'no error codes'
        )
      } else if (typeof result.score === 'number' && result.score < MIN_SCORE) {
        return {
          status: 403,
          body: { message: 'Failed reCAPTCHA verification', score: result.score },
        }
      }
    } catch {
      // Timeout or network error — let the lead through rather than lose it.
    }
  }

  // One list of facts, rendered per channel below.
  const rows = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email],
    ['Postal code', postal.toUpperCase()],
    ...(message ? [['Message', message]] : []),
    ...UTM_KEYS.map((key) => [
      key.replace(/^utm_(.)/, (_, c) => `UTM ${c.toUpperCase()}`),
      field(body[key], LIMITS.utm),
    ]).filter(([, value]) => value),
  ]

  const lead = { rows, name, phone, email, postal }

  // Both channels are optional and independent. They run in parallel so one
  // slow provider does not add its latency to the other.
  const deliveries = []
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    deliveries.push(['telegram', sendTelegram(env, lead)])
  }
  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO) {
    deliveries.push(['email', sendEmail(env, lead)])
  }

  if (!deliveries.length) {
    return {
      status: 500,
      body: { success: false, error: 'No delivery channel is configured' },
    }
  }

  const settled = await Promise.allSettled(deliveries.map(([, task]) => task))
  const failures = []
  let delivered = 0

  settled.forEach((outcome, i) => {
    const channel = deliveries[i][0]
    if (outcome.status === 'fulfilled' && outcome.value.ok) {
      delivered++
      return
    }
    const reason =
      outcome.status === 'rejected'
        ? String(outcome.reason)
        : JSON.stringify(outcome.value.error)
    failures.push({ channel, error: reason })
    console.warn(`[lead] ${channel} delivery failed:`, reason)
  })

  // The lead is safe as long as it reached somewhere. Reporting failure to a
  // customer whose enquiry did arrive would only make them submit again.
  if (delivered > 0) {
    return { status: 200, body: { success: true } }
  }
  return { status: 502, body: { success: false, errors: failures } }
}

async function sendTelegram(env, { rows }) {
  const text =
    '<b>📩 New Lead — SkyLine Stretch Ceilings</b>\n\n' +
    rows
      .map(([label, value]) => {
        if (label === 'Phone') return `<b>Phone:</b> ${phoneLinks(value)}`
        if (label === 'Email') {
          return `<b>Email:</b> <a href="mailto:${escapeAttr(value)}">${escapeHtml(value)}</a>`
        }
        return `<b>${label}:</b> ${escapeHtml(value)}`
      })
      .join('\n')

  const response = await postWithTimeout(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    },
    TELEGRAM_TIMEOUT_MS
  )

  const data = await response.json().catch(() => ({}))
  return response.ok ? { ok: true } : { ok: false, error: data }
}

/**
 * Resend is used because it is an HTTPS API: the Cloudflare Workers runtime
 * has no raw TCP, so SMTP libraries cannot run there. Swapping provider means
 * rewriting this one function — nothing else knows about it.
 */
async function sendEmail(env, { rows, name, email, postal }) {
  const textBody = rows.map(([label, value]) => `${label}: ${value}`).join('\n')

  const htmlRows = rows
    .map(([label, value]) => {
      let shown = escapeHtml(value)
      if (label === 'Phone') shown = `<a href="tel:${escapeAttr(value)}">${shown}</a>`
      if (label === 'Email') shown = `<a href="mailto:${escapeAttr(value)}">${shown}</a>`
      return (
        '<tr>' +
        `<td style="padding:6px 14px 6px 0;color:#6b6f76;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#16181c">${shown}</td>` +
        '</tr>'
      )
    })
    .join('')

  const html =
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6">' +
    '<h2 style="margin:0 0 4px;font-size:18px;color:#16181c">New lead — SkyLine Stretch Ceilings</h2>' +
    '<p style="margin:0 0 18px;color:#6b6f76;font-size:13px">Sent from the website contact form.</p>' +
    `<table style="border-collapse:collapse">${htmlRows}</table>` +
    '</div>'

  const response = await postWithTimeout(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'SkyLine Leads <onboarding@resend.dev>',
        to: env.LEAD_EMAIL_TO.split(',').map((address) => address.trim()).filter(Boolean),
        // Hitting Reply in the inbox answers the customer directly.
        reply_to: email,
        subject: `New lead — ${name} (${postal.toUpperCase()})`,
        text: textBody,
        html,
      }),
    },
    EMAIL_TIMEOUT_MS
  )

  const data = await response.json().catch(() => ({}))
  return response.ok ? { ok: true } : { ok: false, error: data }
}

export const METHOD_NOT_ALLOWED = {
  status: 405,
  body: { message: 'Method not allowed' },
}
