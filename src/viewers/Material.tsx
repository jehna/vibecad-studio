import React from "react";
import { useTexture } from "@react-three/drei";

export default function Material(props) {
  const [matcap1] = useTexture(["/textures/matcap-1.png"]);
  return <meshMatcapMaterial color="#4f46e5" matcap={matcap1} {...props} />;
}
