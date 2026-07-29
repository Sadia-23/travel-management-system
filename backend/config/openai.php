<?php
/**
 * OpenAI API configuration — EXAMPLE FILE.
 *
 * 1. Copy this file to openai.php (same folder)
 * 2. Get an API key at: https://platform.openai.com/api-keys
 * 3. Paste it below, replacing 'YOUR_OPENAI_API_KEY_HERE'
 * 4. openai.php is gitignored, so your real key never gets committed
 *
 * If OPENAI_API_KEY is left as the placeholder value, planner.php will
 * automatically skip the OpenAI call and use its built-in fallback
 * generator instead — the app keeps working either way.
 *
 * Model notes (as of mid-2026): OpenAI retired the GPT-4o/4.1 line from
 * ChatGPT in Feb 2026 and recommends the GPT-5 family going forward.
 * 'gpt-5-mini' is a good cheap/fast default for structured JSON tasks
 * like this one. If it's unavailable on your account, try 'gpt-4o-mini'
 * (still functional on the API as of writing) or 'gpt-5.4-mini'.
 */

define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'YOUR_OPENAI_API_KEY_HERE');
define('OPENAI_MODEL', 'gpt-5-mini');