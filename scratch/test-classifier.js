import { classifyVoiceIntent } from '../src/hooks/useSpeech.js';

const testCases = [
  // 1. Direct commands WITHOUT "Hey Aura"
  { input: 'stop detection', expected: 'stop_detection' },
  { input: 'stop the detection', expected: 'stop_detection' },
  { input: 'stop detecting', expected: 'stop_detection' },
  { input: 'stop alert', expected: 'stop_detection' },
  { input: 'stop alerts', expected: 'stop_detection' },
  { input: 'alert on', expected: 'start_detection' },
  { input: 'alert off', expected: 'stop_detection' },
  { input: 'alerts on', expected: 'start_detection' },
  { input: 'alerts off', expected: 'stop_detection' },
  { input: 'alert mode', expected: 'start_detection' },
  { input: 'alert mode on', expected: 'start_detection' },
  { input: 'alert mode off', expected: 'stop_detection' },
  { input: 'turn off detection', expected: 'stop_detection' },
  { input: 'turn detection off', expected: 'stop_detection' },
  { input: 'turn off alerts', expected: 'stop_detection' },
  { input: 'turn alerts off', expected: 'stop_detection' },
  { input: 'cancel detection', expected: 'stop_detection' },
  { input: 'money', expected: 'currency' },
  { input: 'check money', expected: 'currency' },
  { input: 'ahead', expected: 'describe' },
  { input: "what's ahead", expected: 'describe' },
  { input: 'what is ahead', expected: 'describe' },

  // 2. Prefixed commands WITH "Hey Aura"
  { input: 'Hey Aura stop detection', expected: 'stop_detection' },
  { input: 'Hey Aura stop the detection', expected: 'stop_detection' },
  { input: 'Hey Aura alert on', expected: 'start_detection' },
  { input: 'Hey Aura alert off', expected: 'stop_detection' },
  { input: 'Hey Aura check money', expected: 'currency' },
  { input: 'Hey Aura money', expected: 'currency' },
  { input: "Hey Aura what's ahead", expected: 'describe' },
  { input: 'Hey Aura ahead', expected: 'describe' },

  // 3. Hindi commands
  { input: 'हे ऑरा अलर्ट चालू करो', expected: 'start_detection' },
  { input: 'अलर्ट चालू', expected: 'start_detection' },
  { input: 'हे ऑरा अलर्ट बंद करो', expected: 'stop_detection' },
  { input: 'अलर्ट बंद', expected: 'stop_detection' },
  { input: 'डिटेक्शन बंद', expected: 'stop_detection' },
  { input: 'नोट चेक करो', expected: 'currency' },
  { input: 'सामने क्या है', expected: 'describe' },

  // 4. Conversational user question ("option to listen to user and reply according to that")
  { input: 'what color is my shirt', expected: 'question' },
  { input: 'who is this person', expected: 'question' },
  { input: 'is there a door here', expected: 'question' },
];

let passed = 0;
for (const tc of testCases) {
  const res = classifyVoiceIntent(tc.input);
  const actualType = res ? res.type : null;
  if (actualType === tc.expected) {
    passed++;
    console.log(`✓ "${tc.input}" -> ${actualType}`);
  } else {
    console.error(`✗ "${tc.input}" -> Expected ${tc.expected}, got ${actualType}`);
  }
}

console.log(`\nResult: ${passed}/${testCases.length} passed.`);
process.exit(passed === testCases.length ? 0 : 1);
