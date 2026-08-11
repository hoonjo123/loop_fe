"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="loop 홈">
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

      <nav className="top-actions" aria-label="사용자 메뉴">
        <button className="profile-button" aria-label="내 프로필">
          <span>민</span>
          <b>민들레</b>
        </button>
      </nav>
    </header>
  );
}
