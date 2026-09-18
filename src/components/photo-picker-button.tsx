"use client";

import { useRef } from "react";

// A styled, tap-friendly stand-in for a plain <input type="file">. The real
// file input still does all the work and is still what's focused/clicked
// (just visually hidden) — so on mobile this still opens the phone's normal
// native picker sheet (Photos, Camera, Google Photos, Drive, Files, etc.,
// whatever's installed and registered for images), exactly as a plain file
// input would. The only thing this changes is that the previous default
// tiny "Choose File" browser control is a proper button now.
//
// `multiple` + `onFilesSelected` is an opt-in alternative to the original
// single-file `onFileSelected` — existing callers that only pass
// `onFileSelected` are unaffected, since a plain (non-multiple) file input
// only ever yields one file regardless.

export function PhotoPickerButton({
  onFileSelected,
  onFilesSelected,
  label = "+ Add photo",
  disabled,
  className = "secondary",
  style,
  accept = "image/*",
  multiple = false,
}: {
  onFileSelected?: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  accept?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) {
            if (onFilesSelected) onFilesSelected(Array.from(files));
            else if (onFileSelected) onFileSelected(files[0]);
          }
          // Reset so selecting the exact same file(s) again still fires onChange.
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
