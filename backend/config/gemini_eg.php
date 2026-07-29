<?php
/**
 * Gemini API configuration — EXAMPLE FILE.
 *
 * 1. Copy this file to gemini.php (same folder)
 * 2. Get a free API key at: https://aistudio.google.com/app/apikey
 * 3. Paste it below, replacing 'YOUR_GEMINI_API_KEY_HERE'
 * 4. gemini.php is gitignored, so your real key never gets committed
 *
 * If GEMINI_API_KEY is left as the placeholder value, planner.php will
 * automatically skip the Gemini call and use its built-in fallback
 * generator instead — the app keeps working either way.
 */

define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: 'YOUR_GEMINI_API_KEY_HERE');
define('GEMINI_MODEL', 'gemini-2.5-flash');