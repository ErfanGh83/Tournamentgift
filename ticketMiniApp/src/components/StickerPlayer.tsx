"use client";

import { Player } from "@lottiefiles/react-lottie-player";
import { useRef } from "react";

type Props = {
  src: string;
  width?: string;
  height?: string;
};

export default function Sticker({ src, width, height }: Props) {
  const playerRef = useRef<Player>(null);

  const handleClick = () => {
    playerRef.current?.stop(); // reset to start
    playerRef.current?.play(); // play again
  };

  return (
    <div className="size-full" onClick={handleClick}>
      <Player
        ref={playerRef}
        src={src}
        style={{ width: width, height: height }}
      />
    </div>
  );
}

