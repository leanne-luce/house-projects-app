"use client";

import { useRef } from "react";

// A styled, tap-friendly stand-in for a plain <input type="file">. The real
// file input still does all the work and is still what's focused/clicked
// (just visually hidden) — so on mobile this still opens the phone's normal
// native picker sheet (Photos, Camera, Google Photos, Drive, Files, etc.,
// whatever's installed and registered for images), exactly as a plain file
// input would. The only thing this changes is that the previous default
// tiny "Choose File" browser control is a proper button now.

export function PhotoPickerButton({
  onFileSelected,
  label = "+ Add photo",
  disabled,
  className = "secondary",
  style,
}: {
  onFileSelected: (file: File) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          // Reset so selecting the exact same file again still fires onChange.
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        style={style}
      >
        {label}
      </button>
    </>
  );
}
