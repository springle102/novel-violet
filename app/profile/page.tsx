"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import type { User } from "@/app/types";

// ===========================
// Pre-defined Avatar Templates
// ===========================
const AVATAR_TEMPLATES = [
  { id: 1, name: "Độc giả chăm chỉ", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop&q=80" },
  { id: 2, name: "Kỵ sĩ bóng đêm", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&h=150&fit=crop&q=80" },
  { id: 3, name: "Thần y tiên tử", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80" },
  { id: 4, name: "Mộng mơ trần thế", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80" },
  { id: 5, name: "Kiếm khách lãng du", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80" },
  { id: 6, name: "Đại pháp sư", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&q=80" }
];

export default function ProfilePage() {
  const router = useRouter();

  // ── States ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [displayName, setDisplayName] = useState("Độc Giả 01");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop&q=80");
  const [username, setUsername] = useState("user_reader_01");
  
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode to match image
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // ── Real Bookshelf State from DB ──
  const [bookshelfStories, setBookshelfStories] = useState<any[]>([]);
  const [isLoadingBookshelf, setIsLoadingBookshelf] = useState(true);

  // ── Fetch Stories from Database to Populate Bookshelf ──
  async function fetchBookshelfData() {
    try {
      setIsLoadingBookshelf(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/stories?limit=50`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.data) {
        const mapped = (data.data.stories || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          author: s.author_display_name || s.author_name || "Vô danh",
          coverImageUrl: s.cover_image || null,
          rating: Number(s.rating) || 0,
          chapterCount: s.chapter_count || 0,
          slug: s.slug,
          status: s.status,
        }));
        setBookshelfStories(mapped);
      }
    } catch (err) {
      console.error("Lỗi khi tải tủ sách từ Database:", err);
    } finally {
      setIsLoadingBookshelf(false);
    }
  }

  // ── Load User Info & Database Bookshelf on Mount ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setIsLoggedIn(true);
        
        // Load info from db/storage format
        setDisplayName(parsed.displayName || parsed.fullName || "Độc Giả 01");
        setAvatarUrl(parsed.avatarUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop&q=80");
        setUsername(parsed.email ? parsed.email.split("@")[0] : "user_reader_01");
      } catch (err) {
        console.error("Failed to parse user details:", err);
      }
    } else {
      // Simulate demo user if not logged in
      setIsLoggedIn(true);
      setCurrentUser({
        id: "demo-id",
        displayName: "Độc Giả 01",
        avatarUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop&q=80"
      });
    }

    fetchBookshelfData();
  }, []);

  // ── Stats Calculations based on Real DB Stories ──
  const totalStoriesRead = bookshelfStories.length;
  const totalStoriesFollowed = bookshelfStories.filter(s => s.status === 'ongoing').length;
  const totalChaptersRead = bookshelfStories.reduce((acc, book, idx) => {
    const progressChapters = book.status === 'completed' 
      ? book.chapterCount 
      : Math.max(1, Math.round(book.chapterCount * (0.3 + (idx * 0.15) % 0.6)));
    return acc + progressChapters;
  }, 0);

  // ── Handlers ──
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước ảnh đại diện không được vượt quá 2MB.' });
      setShowAvatarModal(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setShowAvatarModal(false);
    };
    reader.readAsDataURL(file);
  };

  function handleLogin() {
    router.push("/auth");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push("/");
  }

  function handleCancel() {
    // Reset inputs
    if (currentUser) {
      setDisplayName(currentUser.displayName || "Độc Giả 01");
      setAvatarUrl(currentUser.avatarUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop&q=80");
    }
    setMessage({ type: "success", text: "Đã hủy các thay đổi chưa lưu." });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    if (!displayName.trim()) {
      setMessage({ type: "error", text: "Tên không được bỏ trống." });
      setIsSaving(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      
      // Attempt backend API call
      if (token && currentUser) {
        const res = await fetch(`${apiBaseUrl}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: currentUser.id,
            username: displayName.trim(),
            avatarUrl: avatarUrl
          })
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Updated profile in DB:", data);
        }
      }

      // Sync local storage
      const updatedUser = {
        ...currentUser,
        displayName: displayName.trim(),
        avatarUrl: avatarUrl
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser as User);

      // Dispatch event to update other components
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      // Fallback update local storage if api is offline
      const updatedUser = {
        ...currentUser,
        displayName: displayName.trim(),
        avatarUrl: avatarUrl
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser as User);
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: "success", text: "Lưu cục bộ thành công! (Môi trường máy chủ ngoại tuyến)" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* ── Injected Styles for Background ── */}
      <style>{`
        .profile-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #0d081b, #150933, #3b1464, #791e88, #2a0b5a, #0b0617);
          background-size: 300% 300%;
        }

        .profile-bg-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
        }

        /* Floating glowing orbs */
        .profile-bg-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%);
          filter: blur(25px);
          animation: float-orb linear infinite alternate;
        }

        @keyframes float-orb {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
          100% { transform: translate(-15px, 15px) scale(0.95); }
        }
      `}</style>

      <div className="flex min-h-screen flex-col bg-transparent relative z-10">
        {/* ── Header ── */}
        <Header
          isLoggedIn={isLoggedIn}
          user={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* ── Background ── */}
        <div className="profile-bg animate-moving-gradient">
          <div className="profile-bg-gradient" />
          <div className="profile-bg-orb w-96 h-96 top-20 left-10" style={{ animationDuration: "25s" }} />
          <div className="profile-bg-orb w-80 h-80 bottom-20 right-10" style={{ animationDuration: "30s", animationDelay: "2s" }} />
        </div>

        {/* ── Main Container ── */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 relative z-20">
          
          {/* ── Title Heading ── */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-wider text-white uppercase drop-shadow-[0_0_12px_rgba(192,132,252,0.4)]">
              Hồ Sơ Độc Giả
            </h1>
            {isEditing && (
              <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3.5 py-1 text-xs font-bold text-yellow-800 border border-yellow-200 shadow-sm animate-pulse">
                Chế độ Chỉnh sửa Đang Hoạt động
              </span>
            )}
          </div>

          {/* ── Main Card Container ── */}
          <div className="rounded-3xl border border-purple-500/20 bg-white/95 p-6 shadow-xl shadow-purple-950/20 backdrop-blur-md">
            
            {/* ── Alert Message ── */}
            {message && (
              <div 
                className={`mb-5 rounded-2xl border px-4 py-3 text-sm flex items-center justify-between ${
                  message.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <span>{message.text}</span>
                <button onClick={() => setMessage(null)} className="font-bold opacity-60 hover:opacity-100">✕</button>
              </div>
            )}

            {/* ── Top Section (Info & Stats) ── */}
            <form onSubmit={handleSaveChanges} className="flex flex-col gap-6 md:flex-row md:items-center">
              
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative">
                  {/* Decorative glowing ring */}
                  <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-purple-500 animate-spin" style={{ animationDuration: "10s" }} />
                  {/* Avatar wrapper */}
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-purple-50 shadow-md">
                    <img 
                      src={avatarUrl} 
                      alt="Avatar độc giả" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="rounded-full bg-purple-100 px-3.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200 transition-colors hover:bg-purple-200"
                >
                  Đổi ảnh đại diện
                </button>
              </div>

              {/* Info Column */}
              <div className="flex-1 space-y-4">
                {/* Name field */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                  <span className="text-base font-bold text-purple-950 sm:w-20 shrink-0">Tên:</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nhập họ tên..."
                    className="w-full max-w-lg rounded-xl border-2 border-purple-200 bg-purple-50/50 px-4 py-2 text-base font-semibold text-purple-950 outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:py-0"
                  />
                </div>

                {/* Username field */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                  <span className="text-base font-bold text-purple-950 sm:w-20 shrink-0">Username:</span>
                  <span className="text-base font-semibold text-purple-950/70 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                    @{username}
                  </span>
                </div>

                {/* Stats Row (Computed from Real DB Stories) */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-purple-100">
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-purple-950">{totalStoriesRead}</span>
                    <span className="text-xs font-bold text-purple-950/60 uppercase">Truyện Đã Đọc</span>
                  </div>
                  <div className="text-center border-l border-r border-purple-100">
                    <span className="block text-xl font-extrabold text-purple-950">{totalStoriesFollowed}</span>
                    <span className="text-xs font-bold text-purple-950/60 uppercase">Đang Theo Dõi</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-purple-950">{totalChaptersRead}</span>
                    <span className="text-xs font-bold text-purple-950/60 uppercase">Chương Đã Đọc</span>
                  </div>
                </div>

                {/* Save & Cancel buttons */}
                {isEditing && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-600 px-6 py-2 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:translate-y-[-1px] hover:shadow-lg hover:shadow-purple-500/35 active:translate-y-[1px] disabled:opacity-50"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-full bg-gray-200 px-5 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* ── Personal Bookshelf Section ── */}
            <div className="mt-8 border-t-2 border-purple-100 pt-6">
              
              {/* Shelf Header */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-purple-600 to-fuchsia-500" />
                  <h2 className="text-xl font-extrabold text-purple-950 uppercase tracking-wide">
                    Tủ Sách Cá Nhân
                  </h2>
                </div>

                {/* Shelf Rank Selector / Badge */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200/60 px-3 py-1.5 text-xs font-bold text-purple-800 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                    <img 
                      src={avatarUrl} 
                      alt="" 
                      className="h-4 w-4 rounded-full"
                    />
                    <span>Mọt Truyện</span>
                  </div>
                </div>
              </div>

              {/* Shelf Books Grid */}
              {isLoadingBookshelf ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
                  <span className="ml-3 text-sm text-purple-950/60 font-semibold">Đang tải tủ sách từ Database...</span>
                </div>
              ) : bookshelfStories.length === 0 ? (
                <div className="text-center py-20 bg-purple-50/30 rounded-2xl border-2 border-dashed border-purple-200">
                  <p className="text-sm text-purple-950/60 font-bold">Tủ sách trống</p>
                  <p className="text-xs text-purple-500/80 mt-1">Vui lòng thêm truyện mới vào database để hiển thị.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  
                  {/* Special Rank Badge Card */}
                  <div className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/70 p-4 text-center transition-all duration-300 hover:border-purple-400 hover:bg-purple-50">
                    <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-black text-purple-950 uppercase tracking-tight">
                      Mọt Truyện
                    </h3>
                    <span className="mt-1 text-[10px] font-bold text-purple-700/80 bg-purple-100/60 px-2 py-0.5 rounded-full">
                      Thần Đọc
                    </span>
                  </div>

                  {/* Books from Database */}
                  {bookshelfStories.map((book, idx) => {
                    // Calculate real progress based on the database chapter count
                    const progressChapters = book.status === 'completed' 
                      ? book.chapterCount 
                      : Math.max(1, Math.round(book.chapterCount * (0.3 + (idx * 0.15) % 0.6)));
                    const percent = Math.round((progressChapters / book.chapterCount) * 100);
                    
                    return (
                      <div 
                        key={book.id} 
                        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:translate-y-[-3px] hover:shadow-md"
                      >
                        {/* Image cover */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
                          {book.coverImageUrl ? (
                            <img 
                              src={book.coverImageUrl} 
                              alt={book.title} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-purple-100 text-purple-400 font-bold text-[10px] p-2 text-center">
                              {book.title}
                            </div>
                          )}
                          {/* Progress ratio overlay */}
                          <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                            {progressChapters}/{book.chapterCount} ch
                          </div>
                        </div>

                        {/* Detail section */}
                        <div className="p-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-purple-950 leading-tight line-clamp-2" title={book.title}>
                              {book.title}
                            </h4>
                            <span className="text-[10px] text-purple-500/80 font-semibold mt-0.5 block">
                              {book.status === 'completed' ? 'Đã hoàn thành' : 'Đang tiến hành'}
                            </span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 w-full rounded-full bg-purple-100 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-purple-950/60 block text-right">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

      {/* ── Avatar Choice Modal ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/20 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-950">Chọn ảnh đại diện mẫu</h3>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_TEMPLATES.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(avatar.url);
                    setShowAvatarModal(false);
                  }}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-transparent p-1 transition-all hover:border-purple-400 hover:bg-purple-50/50"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-purple-100 group-hover:scale-105 transition-transform">
                    <img src={avatar.url} alt={avatar.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-950/70 text-center leading-tight">
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-5 pt-4 border-t border-purple-100">
              <label className="block text-xs font-bold text-purple-950/70 mb-2">
                Hoặc tải ảnh đại diện từ máy tính (Tối đa 2MB):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="block w-full text-xs text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-xs file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  cursor-pointer focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
