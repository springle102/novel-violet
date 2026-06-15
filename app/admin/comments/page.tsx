'use client';

import { useState, useEffect } from 'react';
import { fetchAdmin, getAdminUser, formatDate } from '../utils';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar?: string;
  user_id: string;
  user_can_comment: boolean;
  story_title: string;
  story_slug: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  // Global Comment setting
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  // Loading state for individual actions (e.g. deletion)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loggedUser = getAdminUser();
    if (!loggedUser || (loggedUser.role !== 'admin' && loggedUser.role !== 'author')) {
      setError('Bạn không có quyền truy cập trang này.');
      setLoading(false);
      return;
    }
    setUserRole(loggedUser.role);
    loadComments();
    loadSettings();
  }, [page]);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      const res = await fetchAdmin(`/api/admin/comments?${queryParams.toString()}`);
      if (res.success) {
        setComments(res.data.comments);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalComments(res.data.pagination.total || 0);
      } else {
        throw new Error(res.error || 'Không tải được danh sách bình luận.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối tới hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetchAdmin('/api/admin/settings');
      if (res.success && Array.isArray(res.data)) {
        const allowCommentsSetting = res.data.find((s: any) => s.key === 'allow_comments');
        if (allowCommentsSetting) {
          setCommentsEnabled(allowCommentsSetting.value === 'true');
        }
      }
    } catch (err) {
      console.error('Không tải được cấu hình hệ thống:', err);
    }
  };

  const handleToggleGlobalComments = async () => {
    if (userRole !== 'admin') return;
    
    const nextStatus = !commentsEnabled;
    const confirmMessage = nextStatus
      ? 'Bạn có chắc chắn muốn BẬT tính năng bình luận cho toàn bộ độc giả trên hệ thống?'
      : 'Bạn có chắc chắn muốn TẮT tính năng bình luận trên toàn bộ hệ thống? (Độc giả sẽ không thể viết bình luận mới)';
      
    if (!window.confirm(confirmMessage)) return;
    
    setSettingsLoading(true);
    try {
      const res = await fetchAdmin('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: [
            { key: 'allow_comments', value: String(nextStatus) }
          ]
        })
      });
      if (res.success) {
        setCommentsEnabled(nextStatus);
        alert(nextStatus ? 'Đã bật tính năng bình luận hệ thống.' : 'Đã tắt tính năng bình luận hệ thống.');
      } else {
        alert(res.error || 'Cập nhật cài đặt hệ thống thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối khi cập nhật cài đặt.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (userRole !== 'admin') return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này vì vi phạm tiêu chuẩn cộng đồng?')) return;
    
    setActionLoadingId(commentId);
    try {
      const res = await fetchAdmin(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        loadComments();
      } else {
        alert(res.error || 'Xóa bình luận thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối khi xóa.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (error && error.includes('quyền truy cập')) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-5 rounded-2xl">
        <h3 className="font-bold text-base">Truy cập bị từ chối</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Bình luận</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin
            ? 'Quản lý tính năng bình luận của độc giả trên hệ thống và xóa bỏ các nội dung vi phạm tiêu chuẩn cộng đồng.'
            : 'Xem danh sách bình luận của các độc giả gửi cho các tác phẩm của bạn.'}
        </p>
      </div>

      {/* Global Comments Toggle (Admin only / Read-only for Author) */}
      <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-gray-850">Quyền bình luận độc giả (Toàn hệ thống)</h2>
          <p className="text-xs text-gray-500">
            Cho phép bật hoặc tắt khả năng viết bình luận của tất cả độc giả trên toàn hệ thống Novel Violet.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${
            commentsEnabled
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-red-50 text-red-650 border-red-200'
          }`}>
            {commentsEnabled ? 'Đang hoạt động (BẬT)' : 'Đã tạm dừng (TẮT)'}
          </span>
          
          {isAdmin ? (
            <button
              onClick={handleToggleGlobalComments}
              disabled={settingsLoading}
              className={`font-bold text-xs px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                commentsEnabled
                  ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 shadow-sm'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-650 hover:bg-emerald-100 shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {settingsLoading ? 'Đang cập nhật...' : commentsEnabled ? 'Tắt bình luận' : 'Bật bình luận'}
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">
              (Chỉ có Quản trị viên mới được thay đổi cài đặt này)
            </span>
          )}
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-500 font-semibold text-sm">Đang tải bình luận...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-medium text-sm">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-xs text-gray-400 font-bold uppercase">
                    <th className="py-4 px-6 w-[200px]">Độc giả</th>
                    <th className="py-4 px-4 w-[200px]">Truyện</th>
                    <th className="py-4 px-4">Nội dung bình luận</th>
                    <th className="py-4 px-4 w-[140px]">Ngày viết</th>
                    {isAdmin && <th className="py-4 px-6 text-center w-[120px]">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {comments.map((cm) => {
                    return (
                      <tr key={cm.id} className="hover:bg-gray-50/50">
                        {/* User Avatar & Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={cm.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cm.user_name)}&background=a855f7&color=fff`}
                              alt={cm.user_name}
                              className="w-8 h-8 rounded-full object-cover border border-purple-100"
                            />
                            <span className="font-bold text-gray-800 truncate max-w-[150px]" title={cm.user_name}>
                              {cm.user_name}
                            </span>
                          </div>
                        </td>

                        {/* Story Title */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-650 truncate block max-w-[180px]" title={cm.story_title}>
                            {cm.story_title}
                          </span>
                        </td>

                        {/* Content */}
                        <td className="py-4 px-4 text-gray-650 max-w-[320px] whitespace-pre-wrap leading-relaxed">
                          {cm.content}
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-gray-500">{formatDate(cm.created_at)}</td>

                        {/* Actions (Admin Only) */}
                        {isAdmin && (
                          <td className="py-4 px-6 text-center">
                            <button
                              disabled={actionLoadingId !== null}
                              onClick={() => handleDeleteComment(cm.id)}
                              className="p-1.5 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                              title="Xóa bình luận vi phạm tiêu chuẩn cộng đồng"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {comments.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-gray-400 font-semibold">
                        Không có bình luận nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-gray-100 flex items-center justify-between">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-500 font-medium">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
