/** Item-specific defeat messages. */
export const DEFEAT_MESSAGES = {
  sweat: {
    icon: '💦',
    message: 'You lost to sweat.',
  },
  germ: {
    icon: '🦠',
    message: 'You lost to bacteria.',
  },
  stink: {
    icon: '🦨',
    message: 'You lost to odor.',
  },
  heat: {
    icon: '🔥',
    message: 'You lost to heat.',
  },
  itch: {
    icon: '⚡',
    message: 'You lost to itch.',
  },
}

export function getDefeatMessage(typeId = 'sweat') {
  return DEFEAT_MESSAGES[typeId] || DEFEAT_MESSAGES.sweat
}
