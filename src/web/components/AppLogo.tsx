
import * as React from 'react';
import Image from 'next/image';

interface AppLogoProps {
  className?: string;
  // Allow any other props that might be passed to an img tag or NextImage
  [key: string]: any;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, ...props }) => (
  <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Image
      src="/images/westudy-logo.png" // **USER ACTION REQUIRED**: Place your logo at public/images/westudy-logo.png
      alt="WeStudy Logo"
      width={200} // Intrinsic width of the image
      height={50} // Intrinsic height of the image
      // Removed priority prop to potentially improve resilience if the image is missing
      data-ai-hint="app logo"
      {...props} // Spread any additional props
    />
  </div>
);

AppLogo.displayName = 'AppLogo';
export default AppLogo;
