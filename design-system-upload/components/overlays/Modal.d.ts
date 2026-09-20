import * as React from "react";

/** Centred dialog on desktop (bottom sheet on phones in the live app), with a sticky header and ✕ close. */
export interface ModalProps {
  title?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
}
export declare function Modal(props: ModalProps): JSX.Element;
