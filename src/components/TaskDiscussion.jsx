import { useState, useEffect, useRef } from 'react';
import { employeeAPI } from '../services/api';
import useEmployeeAuthStore from '../stores/employeeAuthStore';

function TaskDiscussion({ taskId }) {
  const { employee } = useEmployeeAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchTeamMembers();
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getTaskComments(taskId);
      setComments(response.data.comments);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await employeeAPI.getTeamMembers(taskId);
      setTeamMembers(response.data.team_members);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Detect @mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1].toLowerCase());
      setShowMentionDropdown(true);

      // Calculate position for dropdown
      const rect = e.target.getBoundingClientRect();
      const lineHeight = 20;
      const lines = textBeforeCursor.split('\n').length;
      setMentionPosition({
        top: rect.top + (lines * lineHeight) - e.target.scrollTop,
        left: rect.left + 10
      });
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (member) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);

    // Replace the partial @mention with full mention
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.substring(0, lastAtIndex) + `@${member.username} ` + textAfterCursor;

    setNewComment(newText);
    setShowMentionDropdown(false);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current.focus();
      const newCursorPos = lastAtIndex + member.username.length + 2;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionSearch) ||
    member.username.toLowerCase().includes(mentionSearch)
  );

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        content: newComment,
        parent_id: replyingTo?.id || null
      };

      await employeeAPI.createTaskComment(taskId, commentData);
      setNewComment('');
      setReplyingTo(null);
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await employeeAPI.updateTaskComment(taskId, commentId, { content: newContent });
      setEditingComment(null);
      await fetchComments();
    } catch (err) {
      console.error('Failed to edit comment:', err);
      alert('Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await employeeAPI.deleteTaskComment(taskId, commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const renderComment = (comment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const [editContent, setEditContent] = useState(comment.content);

    return (
      <div key={comment.id} className={`comment ${isReply ? 'reply' : ''}`}>
        <div className="comment-avatar">
          <div className="avatar-circle">{comment.employee.name.charAt(0).toUpperCase()}</div>
        </div>
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">{comment.employee.name}</span>
            <span className="comment-role">{comment.employee.role}</span>
            <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
          </div>

          {isEditing ? (
            <div className="comment-edit-form">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="edit-textarea"
                rows={3}
              />
              <div className="edit-actions">
                <button
                  onClick={() => handleEditComment(comment.id, editContent)}
                  className="save-edit-btn"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="cancel-edit-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="comment-text">{comment.content}</div>
          )}

          <div className="comment-actions">
            <button
              onClick={() => setReplyingTo(comment)}
              className="reply-btn"
            >
              Reply
            </button>
            {comment.is_editable && !isEditing && (
              <>
                <button
                  onClick={() => setEditingComment(comment.id)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="replies">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="task-discussion">
      <div className="discussion-header">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="discussion-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3>Discussion</h3>
        <span className="comment-count">({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="comment-form">
        {replyingTo && (
          <div className="replying-to">
            <span>Replying to {replyingTo.employee.name}</span>
            <button type="button" onClick={() => setReplyingTo(null)} className="cancel-reply">
              ×
            </button>
          </div>
        )}
        <div className="form-content">
          <div className="comment-avatar">
            <div className="avatar-circle">{employee?.full_name?.charAt(0).toUpperCase()}</div>
          </div>
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleCommentChange}
              placeholder="Add a comment... Use @ to mention team members"
              className="comment-textarea"
              rows={3}
            />
            {showMentionDropdown && filteredMembers.length > 0 && (
              <div
                className="mention-dropdown"
                style={{ top: mentionPosition.top, left: mentionPosition.left }}
              >
                {filteredMembers.slice(0, 5).map(member => (
                  <div
                    key={member.id}
                    onClick={() => insertMention(member)}
                    className="mention-item"
                  >
                    <div className="mention-avatar">{member.name.charAt(0).toUpperCase()}</div>
                    <div className="mention-info">
                      <div className="mention-name">{member.name}</div>
                      <div className="mention-role">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="submit-comment-btn"
          >
            {submitting ? 'Posting...' : (replyingTo ? 'Post Reply' : 'Post Comment')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="loading-comments">
            <div className="spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>

      <style>{`
        .task-discussion {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .discussion-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .discussion-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .discussion-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .comment-count {
          font-size: 14px;
          color: #9ca3af;
        }

        .comment-form {
          margin-bottom: 32px;
        }

        .replying-to {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f0f2ff;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 13px;
          color: #667eea;
        }

        .cancel-reply {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 20px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0 4px;
        }

        .cancel-reply:hover {
          color: #667eea;
        }

        .form-content {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .comment-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .textarea-wrapper {
          flex: 1;
          position: relative;
        }

        .comment-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .mention-dropdown {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-width: 300px;
        }

        .mention-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .mention-item:hover {
          background: #f9fafb;
        }

        .mention-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .mention-info {
          flex: 1;
        }

        .mention-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .mention-role {
          font-size: 12px;
          color: #9ca3af;
          text-transform: capitalize;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .submit-comment-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-comment-btn:hover:not(:disabled) {
          background: #5568d3;
          transform: translateY(-1px);
        }

        .submit-comment-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .loading-comments,
        .no-comments {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #9ca3af;
          text-align: center;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .comment {
          display: flex;
          gap: 12px;
        }

        .comment.reply {
          margin-left: 52px;
          padding-top: 16px;
        }

        .comment-content {
          flex: 1;
          min-width: 0;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .comment-author {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .comment-role {
          font-size: 12px;
          color: #9ca3af;
          text-transform: capitalize;
        }

        .comment-time {
          font-size: 12px;
          color: #9ca3af;
          margin-left: auto;
        }

        .comment-text {
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          margin-bottom: 8px;
          white-space: pre-wrap;
        }

        .comment-edit-form {
          margin-bottom: 12px;
        }

        .edit-textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid #667eea;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 8px;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-edit-btn,
        .cancel-edit-btn {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .save-edit-btn {
          background: #667eea;
          color: white;
        }

        .save-edit-btn:hover {
          background: #5568d3;
        }

        .cancel-edit-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-edit-btn:hover {
          background: #e5e7eb;
        }

        .comment-actions {
          display: flex;
          gap: 12px;
        }

        .reply-btn,
        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .reply-btn:hover,
        .edit-btn:hover {
          color: #667eea;
        }

        .delete-btn:hover {
          color: #ef4444;
        }

        .replies {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .task-discussion {
            padding: 16px;
          }

          .comment.reply {
            margin-left: 32px;
          }

          .form-content {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default TaskDiscussion;
