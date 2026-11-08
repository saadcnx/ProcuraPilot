export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Source palette
        blush: '#F6E2E9',
        ivory: '#FEFAF3',
        sage: '#B8CFB3',
        olive: '#84A282',
        // Material roles derived from the palette
        surface: '#FEFAF3',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F9F5EC',
        'surface-container': '#F3F0E6',
        'surface-container-high': '#EDEBE0',
        primary: '#4A6648',
        'primary-hover': '#3E583C',
        'on-primary': '#FFFFFF',
        'primary-container': '#B8CFB3',
        'primary-container-hover': '#A8C3A2',
        'on-primary-container': '#17271A',
        secondary: '#84A282',
        'secondary-container': '#DDE8D9',
        'on-secondary-container': '#1E2E1D',
        'tertiary-container': '#F6E2E9',
        'on-tertiary-container': '#5C2238',
        error: '#A3324F',
        'error-hover': '#8C2943',
        ink: '#1C211B',
        'ink-variant': '#4D574B',
        outline: '#77816F',
        'outline-variant': '#D3D8CA',
        'inverse-surface': '#2F362E',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(28,33,27,0.24), 0 1px 3px 1px rgba(28,33,27,0.12)',
        e2: '0 1px 2px rgba(28,33,27,0.24), 0 2px 6px 2px rgba(28,33,27,0.12)',
        e3: '0 4px 8px 3px rgba(28,33,27,0.12), 0 1px 3px rgba(28,33,27,0.24)',
      },
    },
  },
}
