import { createGlobalStyle } from "styled-components";
import SFMonoWoff from "../public/sf-mono-medium.woff";
import SFMonoWoff2 from "../public/sf-mono-medium.woff2";

const FontStyles = createGlobalStyle`

@font-face {
  font-family: 'Roboto Condensed';
  src: url(${SFMonoWoff}) format('woff2'),
       url(${SFMonoWoff2}) format('woff');
}
`;

export default FontStyles;
