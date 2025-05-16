
import * as React from 'react';

interface AppLogoProps extends React.SVGProps<SVGSVGElement> {}

const AppLogo: React.FC<AppLogoProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    className={props.className}
    {...props}
    aria-labelledby="appLogoTitle"
  >
    <title id="appLogoTitle">WeStudy Logo</title>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 30px;
          font-weight: 700;
          fill: url(#logoGradient);
          dominant-baseline: central;
          text-anchor: middle;
        }
        .logo-text-w {
          fill: hsl(var(--primary));
        }
        .logo-text-s {
           fill: hsl(var(--accent));
        }
      `}
    </style>
    <text x="50%" y="50%" className="logo-text">
      <tspan className="logo-text-w">We</tspan><tspan className="logo-text-s">Study</tspan>
    </text>
  </svg>
);

AppLogo.displayName = 'AppLogo';
export default AppLogo;
