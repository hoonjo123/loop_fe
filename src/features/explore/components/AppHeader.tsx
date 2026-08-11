"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Search, UserRound } from "lucide-react";

type AppHeaderProps = {
  onProfileClick: () => void;
  onLogout: () => void;
};

export function AppHeader({ onProfileClick, onLogout }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="loop 홈">
        <span className="brand-mark">l</span>
        <span>loop</span>
      </a>

      <div className={`search ${searchOpen ? "search-open" : ""}`}>
        <Search aria-hidden="true" />
        <input
          aria-label="동네 또는 채팅방 검색"
          placeholder="동네 또는 채팅방을 검색해보세요"
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
        />
      </div>

      <nav ref={profileMenuRef} className="top-actions" aria-label="사용자 메뉴">
        <button
          className={`profile-button ${profileMenuOpen ? "open" : ""}`}
          type="button"
          onClick={() => setProfileMenuOpen((open) => !open)}
          aria-label="사용자 메뉴 열기"
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          aria-controls="profile-dropdown"
        >
          <span>민</span>
          <b>민들레</b>
          <ChevronDown className="profile-chevron" aria-hidden="true" />
        </button>

        {profileMenuOpen && (
          <div id="profile-dropdown" className="profile-dropdown" role="menu">
            <button type="button" role="menuitem" onClick={() => {
              setProfileMenuOpen(false);
              onProfileClick();
            }}>
              <UserRound aria-hidden="true" />
              <span>마이페이지</span>
            </button>
            <button className="logout" type="button" role="menuitem" onClick={() => {
              setProfileMenuOpen(false);
              onLogout();
            }}>
              <LogOut aria-hidden="true" />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
