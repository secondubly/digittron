import { createTheme, type MantineColorsTuple, type MantineThemeOverride, type CSSVariablesResolver } from '@mantine/core';
 
// ─── Color palettes ───────────────────────────────────────────────────────────
// Mantine requires a 10-stop tuple per color key.
// The seed was #964f00 (split-complementary scheme).
// Stops are approximated from the light/dark token pair for each role.
 
const primaryColors: MantineColorsTuple = [
  '#FFF3E8', // 0 – lightest tint
  '#FFE0C2',
  '#F5C49A',
  '#ECA176', // 3 – dark.primary
  '#E08040',
  '#D06020',
  '#BB5816', // 6 – light.primary  ← default shade (6)
  '#A04510',
  '#863309',
  '#6B2303', // 9 – deepest shade
];
 
const secondaryColors: MantineColorsTuple = [
  '#E6F8FB',
  '#BFF0F6',
  '#93E3EE',
  '#6AB9C6', // 3 – dark.secondary
  '#3DA8BA',
  '#1F97AC',
  '#179FB4', // 6 – light.secondary  ← default shade (6)
  '#107A8C',
  '#085768',
  '#003544',
];
 
const accentColors: MantineColorsTuple = [
  '#F5EEFF',
  '#E6D5FF',
  '#D0B0F5',
  '#AD5DCE', // 3 – dark.accent
  '#9040C0',
  '#7530CC',
  '#5F3DC4', // 6 – light.accent  ← default shade (6)
  '#4A2DA8',
  '#361E8C',
  '#221070',
];
 
const successColors: MantineColorsTuple = [
  '#E6FAF5',
  '#BFF2E8',
  '#93E3D4',
  '#74BEAE', // 3 – dark.good
  '#3FA897',
  '#228C7E',
  '#1C917A', // 6 – light.good  ← default shade (6)
  '#136B5A',
  '#09483C',
  '#002820',
];
 
const errorColors: MantineColorsTuple = [
  '#FFF0EE',
  '#FFD5CF',
  '#F5B0A6',
  '#F38A79', // 3 – dark.bad
  '#EC5E4A',
  '#E33A2C',
  '#DF241A', // 6 – light.bad  ← default shade (6)
  '#B81610',
  '#8E0A09',
  '#5A0000',
];
 
const warningColors: MantineColorsTuple = [
  '#FFF5E6',
  '#FFE3BE',
  '#F5C98C',
  '#E49A63', // 3 – dark.warn
  '#DC7E38',
  '#D06018',
  '#E57112', // 6 – light.warn  ← default shade (6)
  '#BB5408',
  '#953E03',
  '#5E2500',
];
 
// ─── CSS variable overrides for light / dark modes ────────────────────────────
// These map the design-token semantics onto Mantine's CSS variable layer so
// that both the component system and your own code can consume them.
 
const lightCssVariables = {
  '--mantine-color-body':          '#F3F6F0',
  '--mantine-color-default-bg':    '#ECEFE9',
  '--mantine-color-text':          '#000000',
  '--mantine-color-dimmed':        '#42443F',
  '--mantine-color-border':        '#DFE2DC',
  '--mantine-color-ring':          '#E47412',
  // Semantic foreground tokens exposed as CSS variables for custom use
  '--color-text-on-color':         '#FFFFFF',
  '--color-primary-fg':            '#FFFFFF',
  '--color-secondary-fg':          '#002027',
  '--color-accent-fg':             '#FBEBFF',
  '--color-good-fg':               '#001D15',
  '--color-warn-fg':               '#300F00',
  '--color-bad-fg':                '#FFFFFF',
} as Record<string, string>;
 
const darkCssVariables = {
  '--mantine-color-body':          '#686A66',
  '--mantine-color-default-bg':    '#60625D',
  '--mantine-color-text':          '#F6F9F2',
  '--mantine-color-dimmed':        '#CFD1CC',
  '--mantine-color-border':        '#71736E',
  '--mantine-color-ring':          '#D2936F',
  '--color-text-on-color':         '#310F00',
  '--color-primary-fg':            '#310F00',
  '--color-secondary-fg':          '#002127',
  '--color-accent-fg':             '#240331',
  '--color-good-fg':               '#00231B',
  '--color-warn-fg':               '#2E1100',
  '--color-bad-fg':                '#3A0000',
} as Record<string, string>;

const darkColors: MantineColorsTuple = [
  '#F2F3F0', // [0] lightest tint
  '#E0E2DC', // [1]
  '#C8CBC4', // [2]
  '#ADB0A9', // [3]
  '#93968F', // [4]
  '#797C76', // [5]
  '#686A66', // [6] ← seed / default shade
  '#565853', // [7]
  '#434640', // [8]
  '#2E302B', // [9] deepest shade
];

// const lightColors: MantineColorsTuple = [
//   '#FFFFFF', // [0] lightest tint
//   '#FAFCF8', // [1]
//   '#F3F6F0', // [2] ← seed
//   '#E8EDE4', // [3]
//   '#D9DED4', // [4]
//   '#C6CBC1', // [5]
//   '#ADB2A8', // [6]
//   '#888D84', // [7]
//   '#5E6359', // [8]
//   '#363B32', // [9] deepest shade
// ];
 
// ─── Theme ────────────────────────────────────────────────────────────────────
 

export const resolver: CSSVariablesResolver = (_theme) => ({
  variables:      {},          // shared (scheme-agnostic)
  light:          lightCssVariables,
  dark:           darkCssVariables,
})

const theme: MantineThemeOverride = createTheme({
  /** Colour palette */
  colors: {
    primary:   primaryColors,
    secondary: secondaryColors,
    accent:    accentColors,
    success:   successColors,
    error:     errorColors,
    warning:   warningColors,
    dark: darkColors,
    orange: primaryColors
  },
 
  /** Active roles */
  primaryColor: 'orange',
  primaryShade: { light: 6, dark: 3 },
  white: '#F3F6F0',
  autoContrast: true,
  luminanceThreshold: 0.3,
  /** Component defaults that respect the token intent */
  components: {
    Badge: {
      defaultProps: { variant: 'light' },
    },
    Button: {
      defaultProps: { variant: 'filled' },
    },
    Alert: {
      styles: {
        root: { borderRadius: 'var(--mantine-radius-md)' },
      },
    },
    Paper: {
      defaultProps: {
        bg: "light-dark(#ECEFE9,#60625D)"
      }
    },
  },
  fontFamily: 'Rubik',
  fontFamilyMonospace: 'Roboto Mono',
  headings: {
    fontFamily: 'Rubik',
    fontWeight: '600',
    sizes: {
      h1: {
        fontSize: 'calc(2.125rem * var(--mantine-scale))',
        lineHeight: '1.3',
        fontWeight: '300'
      },
      h2: {
        fontSize: 'calc(1.625rem * var(--mantine-scale))',
        lineHeight: '1.35',
        fontWeight: '300'
      },
      h3: {
        fontSize: 'calc(1.375rem * var(--mantine-scale))',
        lineHeight: '1.4',
        fontWeight: '300'
      },
      h4: {
        fontSize: 'calc(1.125rem * var(--mantine-scale))',
        lineHeight: '1.45',
        fontWeight: '500'
      },
      h5: {
        fontSize: 'calc(1rem * var(--mantine-scale))',
        lineHeight: '1.5',
        fontWeight: '400'
      },
      h6: {
        fontSize: 'calc(0.875rem * var(--mantine-scale))',
        lineHeight: '1.5',
        fontWeight: '400'
      }
    }
  },
  scale: 1,
  radius: {
    xs: 'calc(0.125rem * var(--mantine-scale))',
    sm: 'calc(0.25rem * var(--mantine-scale))',
    md: 'calc(0.5rem * var(--mantine-scale))',
    lg: 'calc(1rem * var(--mantine-scale))',
    xl: 'calc(2rem * var(--mantine-scale))'
  },
  spacing: {
    xs: 'calc(0.625rem * var(--mantine-scale))',
    sm: 'calc(0.75rem * var(--mantine-scale))',
    md: 'calc(1rem * var(--mantine-scale))',
    lg: 'calc(1.25rem * var(--mantine-scale))',
    xl: 'calc(2rem * var(--mantine-scale))'
  },
  defaultRadius: 'md',
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em'
  },
});

export default theme

// import { createTheme, type MantineThemeOverride } from '@mantine/core';

// const theme: MantineThemeOverride = createTheme({
//   colors: {
//     dark: [
//       '#fff',
//       '#7b92c7',
//       '#4765aa',
//       '#2f4371',
//       '#27375c',
//       '#1c2a4a',
//       '#151e33',
//       '#0e1626',
//       '#0a101d',
//       '#060b15'
//     ],
//     light: [
//       '#fff',
//       '#c5cde0',
//       '#a7b4d0',
//       '#9dabca',
//       '#94a4c5',
//       '#8fa0c3',
//       '#b6c0d8',
//       '#a2afcd',
//       '#97a6c7',
//       '#91a1c4'
//     ],
//     gray: [
//       '#e3e7f1',
//       '#d8ddeb',
//       '#ced4e5',
//       '#c3cadf',
//       '#b8c1d9',
//       '#b8c1d9',
//       '#7b8cb8',
//       '#4b5c8b',
//       '#2a334d',
//       '#090b10'
//     ],
//     blue: [
//       '#d1deeb',
//       '#aecce7',
//       '#8bb9e2',
//       '#68a6de',
//       '#4393d9',
//       '#4393d9',
//       '#1473bb',
//       '#005187',
//       '#003052',
//       '#000e1c'
//     ],
//     green: [
//       '#dafbe1',
//       '#aceebb',
//       '#6fdd8b',
//       '#4ac26b',
//       '#2da44e',
//       '#1a7f37',
//       '#116329',
//       '#044f1e',
//       '#003d16',
//       '#002d11'
//     ],
//     yellow: [
//       '#f7f1e5',
//       '#faeacd',
//       '#fce3b5',
//       '#fddd9d',
//       '#fed687',
//       '#ffd685',
//       '#ffb82d',
//       '#ce8906',
//       '#744d03',
//       '#191102'
//     ],
//     orange: [
//       '#fff1e5',
//       '#ffd8b5',
//       '#ffb77c',
//       '#fb8f44',
//       '#e16f24',
//       '#bc4c00',
//       '#953800',
//       '#762c00',
//       '#5c2200',
//       '#471700'
//     ],
//     red: [
//       '#fff5f5',
//       '#ffe3e3',
//       '#ffc9c9',
//       '#ffa8a8',
//       '#ff8787',
//       '#ff6b6b',
//       '#fa5252',
//       '#f03e3e',
//       '#e03131',
//       '#c92a2a'
//     ],
//     pink: [
//       '#fff0f6',
//       '#ffdeeb',
//       '#fcc2d7',
//       '#faa2c1',
//       '#f783ac',
//       '#f06595',
//       '#e64980',
//       '#d6336c',
//       '#c2255c',
//       '#a61e4d'
//     ],
//     grape: [
//       '#f8f0fc',
//       '#f3d9fa',
//       '#eebefa',
//       '#e599f7',
//       '#da77f2',
//       '#cc5de8',
//       '#be4bdb',
//       '#ae3ec9',
//       '#9c36b5',
//       '#862e9c'
//     ],
//     violet: [
//       '#f3f0ff',
//       '#e5dbff',
//       '#d0bfff',
//       '#b197fc',
//       '#9775fa',
//       '#845ef7',
//       '#7950f2',
//       '#7048e8',
//       '#6741d9',
//       '#5f3dc4'
//     ],
//     indigo: [
//       '#edf2ff',
//       '#dbe4ff',
//       '#bac8ff',
//       '#91a7ff',
//       '#748ffc',
//       '#5c7cfa',
//       '#4c6ef5',
//       '#4263eb',
//       '#3b5bdb',
//       '#364fc7'
//     ],
//     cyan: [
//       '#e3fafc',
//       '#c5f6fa',
//       '#99e9f2',
//       '#66d9e8',
//       '#3bc9db',
//       '#22b8cf',
//       '#15aabf',
//       '#1098ad',
//       '#0c8599',
//       '#0b7285'
//     ],
//     teal: [
//       '#e6fcf5',
//       '#c3fae8',
//       '#96f2d7',
//       '#63e6be',
//       '#38d9a9',
//       '#20c997',
//       '#12b886',
//       '#0ca678',
//       '#099268',
//       '#087f5b'
//     ],
//     lime: [
//       '#f4fce3',
//       '#e9fac8',
//       '#d8f5a2',
//       '#c0eb75',
//       '#a9e34b',
//       '#94d82d',
//       '#82c91e',
//       '#74b816',
//       '#66a80f',
//       '#5c940d'
//     ]
//   },
//   primaryColor: 'yellow',
//   primaryShade: {
//     light: 6,
//     dark: 5
//   },
//   white: '#ffffff',
//   black: '#24292f',
//   autoContrast: true,
//   luminanceThreshold: 0.3,
//   defaultGradient: {
//     from: 'blue',
//     to: 'gray',
//     deg: 45
//   },
//   fontFamily: 'Rubik',
//   fontFamilyMonospace: 'Roboto Mono',
//   headings: {
//     fontFamily: 'Rubik',
//     fontWeight: '600',
//     sizes: {
//       h1: {
//         fontSize: 'calc(2.125rem * var(--mantine-scale))',
//         lineHeight: '1.3',
//         fontWeight: '300'
//       },
//       h2: {
//         fontSize: 'calc(1.625rem * var(--mantine-scale))',
//         lineHeight: '1.35',
//         fontWeight: '300'
//       },
//       h3: {
//         fontSize: 'calc(1.375rem * var(--mantine-scale))',
//         lineHeight: '1.4',
//         fontWeight: '300'
//       },
//       h4: {
//         fontSize: 'calc(1.125rem * var(--mantine-scale))',
//         lineHeight: '1.45',
//         fontWeight: '500'
//       },
//       h5: {
//         fontSize: 'calc(1rem * var(--mantine-scale))',
//         lineHeight: '1.5',
//         fontWeight: '400'
//       },
//       h6: {
//         fontSize: 'calc(0.875rem * var(--mantine-scale))',
//         lineHeight: '1.5',
//         fontWeight: '400'
//       }
//     }
//   },
//   scale: 1,
//   radius: {
//     xs: 'calc(0.125rem * var(--mantine-scale))',
//     sm: 'calc(0.25rem * var(--mantine-scale))',
//     md: 'calc(0.5rem * var(--mantine-scale))',
//     lg: 'calc(1rem * var(--mantine-scale))',
//     xl: 'calc(2rem * var(--mantine-scale))'
//   },
//   spacing: {
//     xs: 'calc(0.625rem * var(--mantine-scale))',
//     sm: 'calc(0.75rem * var(--mantine-scale))',
//     md: 'calc(1rem * var(--mantine-scale))',
//     lg: 'calc(1.25rem * var(--mantine-scale))',
//     xl: 'calc(2rem * var(--mantine-scale))'
//   },
//   defaultRadius: 'md',
//   breakpoints: {
//     xs: '36em',
//     sm: '48em',
//     md: '62em',
//     lg: '75em',
//     xl: '88em'
//   },
//   fontSmoothing: true,
//   focusRing: 'auto',
//   components: {}
// });

// export default theme;