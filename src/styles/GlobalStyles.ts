import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Base styles */
  html, body {
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.colors.background.default};
    color: ${props => props.theme.colors.text.primary};
    font-family: ${props => props.theme.typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Box sizing */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* Focus styles */
  :focus {
    outline: none;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Selection styles */
  ::selection {
    background-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.contrastText};
  }

  /* Link styles */
  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};
    
    &:hover {
      color: ${props => props.theme.colors.primary.light};
    }
  }

  /* Button reset */
  button {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-weight: 600;
    line-height: 1.2;
  }

  /* Paragraphs */
  p {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  /* Lists */
  ul, ol {
    padding-left: 2rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  /* Code */
  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875em;
    color: ${props => props.theme.colors.secondary.main};
    background-color: rgba(139, 92, 246, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
  }

  /* Pre */
  pre {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875em;
    background-color: rgba(30, 41, 59, 0.7);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
  }
`;

export default GlobalStyles;
