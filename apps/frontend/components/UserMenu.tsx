"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { useUserStore } from "@/store/user-store";
import { User } from "lucide-react";

type UserMenuProps = {
  name: string;
  initialAvatarUrl?: string | null;
};

export function UserMenu({ name, initialAvatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarUrl = useUserStore((s) => s.user?.avatarUrl) ?? initialAvatarUrl;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/60 focus:outline-none cursor-pointer flex items-center justify-center bg-white/20"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50 py-1">
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
            Welcome, <span className="font-semibold text-gray-800">{name}</span>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Profile
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
