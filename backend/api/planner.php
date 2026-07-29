<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/groq.php';

header("Content-Type: application/json");

// POST /planner.php
// Body: {
//   "destination": "Cox's Bazar", "budget": 15000, "days": 3, "style": "relaxed",
//   "preferences": ["Food & Cuisine", "Nature & Scenery"],
//   "conversation": [ {"role":"user","content":"Plan a 3 day trip..."} ],   // full chat so far, latest message last
//   "current_itinerary": { ... } | null                                    // the itinerary as it stands right now
// }
//
// Returns a conversational reply PLUS the (possibly updated) structured
// itinerary, so the frontend can render both a chat bubble and a live
// itinerary panel:
// {
//   "success": true, "source": "groq" | "fallback",
//   "reply": "Here's a first draft...",
//   "itinerary": { destination, days, budget, style, preferences,
//                  day_plans: [ { day, title, morning, afternoon, evening,
//                                 accommodation, estimated_cost } ],
//                  budget_breakdown: { accommodation, food, transport, activities },
//                  tips: [ "..." ] }
// }
//
// Always returns something usable: tries Groq (multi-turn, if a real key
// is configured), and falls back to a rule-based generator/editor that
// still understands a handful of common refinement requests offline.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$destination = trim($data['destination'] ?? '');
$budget      = isset($data['budget']) ? (float)$data['budget'] : 0;
$days        = isset($data['days']) ? (int)$data['days'] : 0;
$style       = trim($data['style'] ?? 'balanced');

$preferences = $data['preferences'] ?? [];
if (!is_array($preferences)) {
    $preferences = array_filter(array_map('trim', explode(',', (string)$preferences)));
}
$preferences = array_values(array_filter(array_map('trim', $preferences)));

$conversation = is_array($data['conversation'] ?? null) ? $data['conversation'] : [];
$currentItinerary = is_array($data['current_itinerary'] ?? null) ? $data['current_itinerary'] : null;

if ($destination === '' || $days <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Destination and number of days are required."]);
    exit;
}
if ($budget < 0) $budget = 0;

// The latest message in the conversation is what we're responding to.
$lastUserMessage = '';
for ($i = count($conversation) - 1; $i >= 0; $i--) {
    if (($conversation[$i]['role'] ?? '') === 'user') {
        $lastUserMessage = (string)($conversation[$i]['content'] ?? '');
        break;
    }
}

$reply = null;
$itinerary = null;
$source = 'fallback';

// ---------------------------------------------------------------
// 1) Try Groq (multi-turn chat, JSON-structured itinerary)
// ---------------------------------------------------------------
if (defined('GROQ_API_KEY') && GROQ_API_KEY !== 'YOUR_GROQ_API_KEY_HERE' && GROQ_API_KEY !== '') {
    $schemaExample = json_encode([
        "reply" => "string",
        "itinerary" => [
            "destination" => $destination,
            "days" => $days,
            "budget" => $budget,
            "style" => $style,
            "preferences" => $preferences,
            "day_plans" => [[
                "day" => 1, "title" => "string", "morning" => "string", "afternoon" => "string",
                "evening" => "string", "accommodation" => "string", "estimated_cost" => 0
            ]],
            "budget_breakdown" => ["accommodation" => 0, "food" => 0, "transport" => 0, "activities" => 0],
            "tips" => ["string"],
        ],
    ]);

    $currentItineraryJson = $currentItinerary !== null
        ? json_encode($currentItinerary)
        : 'null (this is the first message in the conversation — there is no itinerary yet; build a fresh one from the trip context below)';

    $systemInstruction =
        "You are a friendly travel-planning assistant having an ongoing conversation with a traveler. "
        . "Trip context: destination={$destination}, days={$days}, total budget={$budget} BDT, style={$style}, "
        . "preferences=" . (count($preferences) ? implode(', ', $preferences) : 'none') . ".\n\n"
        . "The itinerary as it currently stands (this is ground truth — it already reflects everything agreed "
        . "so far, including any manual edits the traveler made by hand in the itinerary panel, which may not "
        . "appear anywhere in the chat transcript) is:\n{$currentItineraryJson}\n\n"
        . "Respond with ONLY a single raw JSON object (no markdown fences, no commentary outside the JSON) "
        . "matching this shape exactly: {$schemaExample}\n"
        . "The \"reply\" field is a short, warm, conversational message (2-4 sentences) acknowledging what changed "
        . "or answering their question. The \"itinerary\" field must always describe the COMPLETE current "
        . "itinerary (all days), not just what changed.\n"
        . "Base the updated itinerary on the one given above: apply ONLY what the traveler's latest message asks "
        . "for, and keep every other field — including any manual edits already present above — exactly as it "
        . "was unless the request clearly implies changing it. Never silently revert or reconstruct fields from "
        . "the chat history instead of the itinerary state given above.\n"
        . "Keep estimated costs realistic and the day_plans array length equal to the number of days the "
        . "traveler currently wants (adjust it if they ask to add/remove days). "
        . "If the traveler's message isn't about the itinerary, still repeat the current itinerary unchanged.";

    $messages = [["role" => "system", "content" => $systemInstruction]];
    foreach ($conversation as $msg) {
        $role = ($msg['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user';
        $text = (string)($msg['content'] ?? '');
        if ($text === '') continue;
        $messages[] = ["role" => $role, "content" => $text];
    }

    // Need at least one real user message beyond the system prompt.
    if (count($messages) > 1) {
        $url = "https://api.groq.com/openai/v1/chat/completions";

        $payload = json_encode([
            "model" => GROQ_MODEL,
            "messages" => $messages,
            "response_format" => ["type" => "json_object"],
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: Bearer " . GROQ_API_KEY
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $curlErr  = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response !== false && $curlErr === '' && $httpCode === 200) {
            $decoded = json_decode($response, true);
            $text = $decoded['choices'][0]['message']['content'] ?? null;

            if ($text !== null && trim($text) !== '') {
                // Strip stray ```json fences if the model added them anyway.
                $clean = preg_replace('/^```(json)?|```$/m', '', trim($text));
                $parsed = json_decode(trim($clean), true);

                if (is_array($parsed) && isset($parsed['itinerary']['day_plans'])) {
                    $reply = trim((string)($parsed['reply'] ?? '')) !== '' ? $parsed['reply'] : 'Here you go!';
                    $itinerary = $parsed['itinerary'];
                    $source = 'groq';
                }
            }
        }
        // On any failure (bad key, quota, network, unexpected/unparseable
        // response) we silently continue to the fallback below.
    }
}

// ---------------------------------------------------------------
// 2) Fallback: rule-based generator + simple keyword-based editor
// ---------------------------------------------------------------
if ($itinerary === null) {
    $preferenceThemes = [
        'Nature & Scenery'      => ['label' => 'nature & scenery', 'morning' => 'Visit a scenic viewpoint or natural landmark', 'afternoon' => 'Walk through a nearby park or green space', 'evening' => 'Relax and enjoy the sunset'],
        'Food & Cuisine'        => ['label' => 'food & cuisine', 'morning' => 'Try a popular breakfast spot', 'afternoon' => 'Sample local street food and specialties', 'evening' => 'Dinner at a well-reviewed local restaurant'],
        'Adventure & Outdoor'   => ['label' => 'adventure & outdoor activities', 'morning' => 'Outdoor activity such as hiking or trekking', 'afternoon' => 'Water sports or an adventure excursion', 'evening' => 'Rest and recover after an active day'],
        'Culture & Heritage'    => ['label' => 'culture & heritage', 'morning' => 'Visit a historical site or museum', 'afternoon' => 'Explore cultural landmarks', 'evening' => 'Traditional dinner and local entertainment'],
        'Shopping'              => ['label' => 'shopping', 'morning' => 'Browse a local market', 'afternoon' => 'Shopping at popular retail areas', 'evening' => 'Wind down at a café'],
        'Nightlife'             => ['label' => 'nightlife', 'morning' => 'Slow start to the day', 'afternoon' => 'Sightseeing at a relaxed pace', 'evening' => 'Enjoy the local nightlife scene'],
        'Relaxation & Wellness' => ['label' => 'relaxation & wellness', 'morning' => 'Spa or wellness session', 'afternoon' => 'Free time by the beach/resort', 'evening' => 'Quiet dinner and early rest'],
        'Wildlife'              => ['label' => 'wildlife', 'morning' => 'Visit a nearby wildlife reserve or park', 'afternoon' => 'Guided wildlife spotting tour', 'evening' => 'Relax back at the accommodation'],
    ];

    $styleDefaults = [
        'relaxed'   => ['morning' => 'Slow start with a leisurely breakfast', 'afternoon' => 'Light sightseeing with plenty of downtime', 'evening' => 'Relaxed dinner nearby'],
        'balanced'  => ['morning' => 'Visit a popular local attraction', 'afternoon' => 'Free time and casual exploring', 'evening' => 'Dinner at a recommended local spot'],
        'adventure' => ['morning' => 'Active outdoor activity', 'afternoon' => 'Continue exploring off-the-beaten-path spots', 'evening' => 'Recover with a hearty dinner'],
        'luxury'    => ['morning' => 'Breakfast at a premium spot', 'afternoon' => 'Guided tour with upscale comforts', 'evening' => 'Fine dining experience'],
        'budget'    => ['morning' => 'Free or low-cost local attraction', 'afternoon' => 'Self-guided walking exploration', 'evening' => 'Budget-friendly local eatery'],
    ];

    // Builds a brand-new itinerary from scratch.
    $buildFresh = function () use ($destination, $days, $budget, $style, $preferences, $preferenceThemes, $styleDefaults) {
        $perDay = $days > 0 ? round($budget / $days) : 0;
        $themeKeys = count($preferences) > 0 ? $preferences : [];
        $default = $styleDefaults[$style] ?? $styleDefaults['balanced'];

        $dayPlans = [];
        for ($i = 1; $i <= $days; $i++) {
            if (count($themeKeys) > 0) {
                $theme = $preferenceThemes[$themeKeys[($i - 1) % count($themeKeys)]] ?? null;
            } else {
                $theme = null;
            }
            $slot = $theme ?: $default;

            $dayPlans[] = [
                "day" => $i,
                "title" => "Day {$i}: " . ($theme['label'] ?? ucfirst($style)) . " in {$destination}",
                "morning" => $slot['morning'],
                "afternoon" => $slot['afternoon'],
                "evening" => $slot['evening'],
                "accommodation" => "Centrally located stay in {$destination}",
                "estimated_cost" => $perDay,
            ];
        }

        return [
            "destination" => $destination,
            "days" => $days,
            "budget" => $budget,
            "style" => $style,
            "preferences" => $preferences,
            "day_plans" => $dayPlans,
            "budget_breakdown" => [
                "accommodation" => round($budget * 0.40),
                "food" => round($budget * 0.25),
                "transport" => round($budget * 0.15),
                "activities" => round($budget * 0.20),
            ],
            "tips" => [
                "Book accommodation in advance during peak season.",
                "Keep some buffer budget for unexpected expenses.",
                "Confirm local transport options ahead of each day.",
            ],
        ];
    };

    if ($currentItinerary === null) {
        // First message in the conversation — generate from scratch.
        $itinerary = $buildFresh();
        $reply = "Here's a first draft " . $days . "-day itinerary for {$destination}! "
            . "You can ask me to tweak it — try things like \"make it more budget-friendly\", "
            . "\"make it more relaxed\", \"add a day\", or \"remove day 2\".";
    } else {
        // Refine the existing itinerary based on keywords in the latest message.
        $itinerary = $currentItinerary;
        $msg = strtolower($lastUserMessage);
        $changed = false;
        $notes = [];

        if (preg_match('/\b(cheap|cheaper|budget|less expensive|lower cost|save money)\b/', $msg)) {
            foreach ($itinerary['day_plans'] as &$d) {
                $d['estimated_cost'] = round(($d['estimated_cost'] ?? 0) * 0.85);
            }
            unset($d);
            foreach ($itinerary['budget_breakdown'] as $k => $v) {
                $itinerary['budget_breakdown'][$k] = round($v * 0.9);
            }
            $notes[] = "trimmed costs to be more budget-friendly";
            $changed = true;
        }

        if (preg_match('/\b(luxury|upscale|premium|splurge)\b/', $msg)) {
            foreach ($itinerary['day_plans'] as &$d) {
                $d['estimated_cost'] = round(($d['estimated_cost'] ?? 0) * 1.25);
                $d['accommodation'] = "Upscale/premium stay in {$destination}";
            }
            unset($d);
            $notes[] = "upgraded accommodation and spending to a more premium level";
            $changed = true;
        }

        if (preg_match('/\b(relax|relaxed|slow|slower|chill)\b/', $msg)) {
            foreach ($itinerary['day_plans'] as &$d) {
                $d['afternoon'] = "Free time to relax — no fixed plans";
            }
            unset($d);
            $notes[] = "opened up more free/relaxed time in the afternoons";
            $changed = true;
        }

        if (preg_match('/\b(adventure|active|hike|hiking|outdoor)\b/', $msg)) {
            foreach ($itinerary['day_plans'] as &$d) {
                $d['morning'] = "Active outdoor activity (hiking/trekking/water sports)";
            }
            unset($d);
            $notes[] = "added more active/outdoor activities in the mornings";
            $changed = true;
        }

        if (preg_match('/\badd\b.*\bday\b/', $msg)) {
            $lastDay = end($itinerary['day_plans']);
            $newDayNum = ($lastDay['day'] ?? count($itinerary['day_plans'])) + 1;
            $clone = $lastDay;
            $clone['day'] = $newDayNum;
            $clone['title'] = "Day {$newDayNum}: More time in {$destination}";
            $itinerary['day_plans'][] = $clone;
            $itinerary['days'] = count($itinerary['day_plans']);
            $notes[] = "added an extra day (Day {$newDayNum})";
            $changed = true;
        }

        if (preg_match('/\bremove\b.*\bday\s*(\d+)/', $msg, $m)) {
            $target = (int)$m[1];
            $itinerary['day_plans'] = array_values(array_filter(
                $itinerary['day_plans'],
                fn($d) => ($d['day'] ?? null) !== $target
            ));
            foreach ($itinerary['day_plans'] as $idx => &$d) {
                $d['day'] = $idx + 1;
            }
            unset($d);
            $itinerary['days'] = count($itinerary['day_plans']);
            $notes[] = "removed Day {$target} and renumbered the rest";
            $changed = true;
        }

        if ($changed) {
            $reply = "Done — I " . implode(' and ', $notes) . ".";
        } else {
            $reply = "I've noted that. I'm currently running in offline mode, so I can only apply a "
                . "few standard tweaks: try \"make it cheaper\", \"make it more luxurious\", "
                . "\"make it more relaxed\", \"add more adventure\", \"add a day\", or \"remove day 2\". "
                . "For fully custom edits, add a Groq API key in backend/config/groq.php.";
        }
    }
}

echo json_encode([
    "success" => true,
    "source" => $source, // "groq" or "fallback"
    "reply" => $reply,
    "itinerary" => $itinerary,
]);