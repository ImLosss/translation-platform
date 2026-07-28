'use client';

import { useSidebar } from "./SidebarProvider";


export default function HamburgerButton() {
  const { toggle } = useSidebar();

  return (
    <button
      className="hamburger"
      onClick={() => toggle()}
      aria-label="Toggle sidebar"
    >
      <i className="fas fa-bars"></i>
    </button>
  );
}