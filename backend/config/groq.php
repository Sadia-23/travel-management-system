<?php
/**
 * Groq API configuration — EXAMPLE FILE.
 *
 * 1. Copy this file to groq.php (same folder)
 * 2. Get a free API key at: https://console.groq.com/keys
 *    (sign up with email/Google/GitHub — no credit card required)
 * 3. Paste it below, replacing 'YOUR_GROQ_API_KEY_HERE'
 * 4. groq.php is gitignored, so your real key never gets committed
 *
 * If GROQ_API_KEY is left as the placeholder value, planner.php will
 * automatically skip the Groq call and use its built-in fallback
 * generator instead — the app keeps working either way.
 *
 * Free tier (as of mid-2026): 30 requests/minute, 14,400 requests/day,
 * no credit card, no time limit. Plenty for testing/personal use.
 *
 * Model notes: 'llama-3.3-70b-versatile' is a good default — strong at
 * following JSON-formatting instructions and supports Groq's JSON mode.
 * If you want something faster/cheaper-on-rate-limit, try
 * 'llama-3.1-8b-instant' instead (slightly less reliable at formatting).
 */

define('GROQ_API_KEY', getenv('GROQ_API_KEY') ?: 'YOUR_GROQ_API_KEY_HERE');
define('GROQ_MODEL', 'llama-3.3-70b-versatile');