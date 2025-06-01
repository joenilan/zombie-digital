import { Variants } from 'framer-motion'

// Consistent easing curves
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  sharp: [0.4, 0, 0.2, 1],
  gentle: [0.25, 0.1, 0.25, 1]
} as const

// Consistent timing
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7
} as const

// Page-level animations
export const pageAnimations: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: durations.normal,
      ease: easings.smooth
    }
  }
}

// Card animations
export const cardAnimations: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: durations.fast,
      ease: easings.gentle
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: durations.fast,
      ease: easings.sharp
    }
  }
}

// Stagger container
export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Stagger items
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

// Fade animations
export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  enter: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.gentle
    }
  }
}

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

// Scale animations
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.bounce
    }
  }
}

export const scaleInCenter: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth
    }
  }
}

// Button animations
export const buttonAnimations: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: durations.fast,
      ease: easings.gentle
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: durations.fast,
      ease: easings.sharp
    }
  }
}

// Loading animations
export const pulseAnimation: Variants = {
  initial: {
    opacity: 0.6
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: easings.gentle
    }
  }
}

export const spinAnimation: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// Slide animations
export const slideInLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0
  },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const slideInRight: Variants = {
  initial: {
    x: 100,
    opacity: 0
  },
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const slideInUp: Variants = {
  initial: {
    y: 100,
    opacity: 0
  },
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

export const slideInDown: Variants = {
  initial: {
    y: -100,
    opacity: 0
  },
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

// Cyber-themed animations
export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(236, 72, 153, 0.3)',
      '0 0 40px rgba(236, 72, 153, 0.6)',
      '0 0 20px rgba(236, 72, 153, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.gentle
    }
  }
}

// Text-specific glow animation with fade-in
export const textGlowWithFade: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'drop-shadow(0 0 8px rgba(255, 0, 229, 0.4))'
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: [
      'drop-shadow(0 0 8px rgba(255, 0, 229, 0.4))',
      'drop-shadow(0 0 16px rgba(255, 0, 229, 0.8))',
      'drop-shadow(0 0 8px rgba(255, 0, 229, 0.4))'
    ],
    transition: {
      opacity: {
        duration: durations.slow,
        ease: easings.smooth
      },
      y: {
        duration: durations.slow,
        ease: easings.smooth
      },
      filter: {
        duration: 2,
        repeat: Infinity,
        ease: easings.gentle,
        delay: durations.slow // Start glow after fade-in completes
      }
    }
  }
}

// Text-specific glow animation using drop-shadow
export const textGlow: Variants = {
  animate: {
    filter: [
      'drop-shadow(0 0 8px rgba(236, 72, 153, 0.4))',
      'drop-shadow(0 0 16px rgba(236, 72, 153, 0.8))',
      'drop-shadow(0 0 8px rgba(236, 72, 153, 0.4))'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.gentle
    }
  }
}

export const cyberGlow: Variants = {
  initial: {
    filter: 'drop-shadow(0 0 0px rgba(103, 232, 249, 0))'
  },
  hover: {
    filter: 'drop-shadow(0 0 8px rgba(103, 232, 249, 0.5))',
    transition: {
      duration: durations.normal,
      ease: easings.gentle
    }
  }
}

// Navigation animations
export const navItemAnimation: Variants = {
  initial: {
    opacity: 0,
    y: -10
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth
    }
  }
}

// Modal animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0
  },
  enter: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.gentle
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.gentle
    }
  }
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
} 