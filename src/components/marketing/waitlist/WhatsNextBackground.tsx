import React from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

// Minimal shader background for What's Next using LXERA colors only
export default function WhatsNextBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#7AE5C6", "#164e63", "#0b1522"]}
        speed={0.25}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-35"
        colors={["#000000", "#7AE5C6", "#0b1522"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
      />
    </div>
  );
}


