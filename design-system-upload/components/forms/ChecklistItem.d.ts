import * as React from "react";

/** One checklist line on a Detail page; struck through and faded when done. */
export interface ChecklistItemProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}
export declare function ChecklistItem(props: ChecklistItemProps): JSX.Element;
