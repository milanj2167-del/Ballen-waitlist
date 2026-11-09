/** Item-specific defeat messages. */
export const DEFEAT_MESSAGES = {
  sweat: {
    icon: '💦',
    message: 'You lost to sweat, so join the waitlist to win over the problem in real life.',
  },
  germ: {
    icon: '🦠',
    message: 'You lost to bacteria, so join the waitlist to win over the problem in real life.',
  },
  stink: {
    icon: '🦨',
    message: 'You lost to odor, so join the waitlist to win over the problem in real life.',
  },
  heat: {
    icon: '🔥',
    message: 'You lost to heat, so join the waitlist to win over the problem in real life.',
  },
  itch: {
    icon: '⚡',
    message: 'You lost to itch, so join the waitlist to win over the problem in real life.',
  },
}

export function getDefeatMessage(typeId = 'sweat') {
  return DEFEAT_MESSAGES[typeId] || DEFEAT_MESSAGES.sweat
}
