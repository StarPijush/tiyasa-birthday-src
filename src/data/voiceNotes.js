export const voiceNotes = [
  {
    id: 'annoying',
    icon: '🐻',
    title: 'happy birthday motuuu ',
    context: 'this one took 8 tries',
    detail: 'teasing, but unfortunately true',
    duration: 16,
    tone: 'playful',
    reveal: 'i was smiling while recording this.',
    script: [
      { at: 0.12, text: 'first of all, you are very annoying.' },
      { at: 0.35, text: 'like genuinely. professionally annoying.' },
      { at: 0.62, text: 'but also... i love you.' },
      { at: 0.84, text: 'do not smile. i know you smiled.' },
    ],
    hold: false,
    audio: '/audio/voice-notes/voice-note-1.mp3'
  },
  {
    id: 'missme',
    icon: '🎀',
    title: 'open when you miss me',
    context: 'hold to unlock',
    detail: 'kept somewhere soft',
    duration: 21,
    tone: 'soft',
    reveal: 'this was meant for the nights that feel too far.',
    script: [
      { at: 0.12, text: 'if you miss me, listen softly.' },
      { at: 0.38, text: 'i am probably missing you too.' },
      { at: 0.65, text: 'distance is stupid.' },
      { at: 0.88, text: 'come here. virtually, for now.' },
    ],
    hold: true,
    audio: '/audio/voice-notes/voice-note-2.mp3'
  },
  {
    id: 'sleep',
    icon: '🌙',
    title: "couldn't sleep tonight",
    context: 'recorded at 2:14 AM',
    detail: 'small sleepy message',
    duration: 18,
    tone: 'sleepy',
    reveal: 'i almost sent this at 3am.',
    script: [
      { at: 0.08, text: 'hi... um. you are probably asleep.' },
      { at: 0.32, text: 'i could not sleep, obviously.' },
      { at: 0.58, text: 'i just missed you a little too loudly.' },
      { at: 0.82, text: 'okay bye before i get embarrassing.' },
    ],
    hold: false,
    audio: '/audio/voice-notes/voice-note-3.mp3'
  },
  {
    id: 'hard_to_say',
    icon: '🥹',
    title: 'this one was hard to say',
    context: 'but i meant every word',
    detail: 'very honest, very quiet',
    duration: 28,
    tone: 'vulnerable',
    reveal: 'i had to restart because my voice got weird.',
    script: [
      { at: 0.1, text: 'this one is harder.' },
      { at: 0.36, text: 'because jokes are easier than honesty.' },
      { at: 0.62, text: 'but you make my life softer.' },
      { at: 0.86, text: 'and i am really grateful you exist.' },
    ],
    hold: false,
    audio: '/audio/voice-notes/voice-note-4.mp3'
  },
  {
    id: 'more_than_say',
    icon: '💗',
    title: 'i love you more than i say',
    context: 'recorded quietly at night',
    detail: 'soft emotional confession',
    duration: 24,
    tone: 'warm',
    reveal: 'i paused here because i got shy.',
    script: [
      { at: 0.1, text: 'i keep trying to say this normally...' },
      { at: 0.34, text: 'and then i forget every word.' },
      { at: 0.61, text: 'you matter to me. a lot.' },
      { at: 0.86, text: 'more than i act like sometimes.' },
    ],
    hold: false,
    audio: '/audio/voice-notes/voice-note-5.mp3'
  },
];

export const finalNote = {
  id: 'birthday_real',
  icon: '❤️',
  title: 'happy birthday, my love',
  context: 'the one i really wanted to send',
  detail: 'the one i meant the most',
  duration: 19,
  tone: 'final',
  reveal: 'happy birthday, my love.',
  script: [
    { at: 0.12, text: 'happy birthday, my love.' },
    { at: 0.38, text: 'i wish i could say this right next to you.' },
    { at: 0.64, text: 'but until then...' },
    { at: 0.86, text: 'this is my little voice reaching you.' },
  ],
  audio: '/audio/voice-notes/voice-note-6.mp3'
};
