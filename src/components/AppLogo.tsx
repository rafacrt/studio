
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
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 30px;
          font-weight: 700;
          dominant-baseline: central;
          text-anchor: middle;
        }
        .logo-text-w {
          fill: hsl(var(--primary)); /* Agora será o novo azul #416ed3 */
        }
        .logo-text-s {
           fill: hsl(var(--foreground)); /* Agora será branco #ffffff */
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
