import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Edit3, Copy, Users, MoreHorizontal, Trash2 } from 'lucide-react';
import { Book as BookType } from '../../types';
import { useBooks } from '../../hooks/useBooks';
import { useEntries } from '../../hooks/useEntries';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface BookCardProps {
  book: BookType;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(book.name);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { updateBook, duplicateBook, deleteBook } = useBooks();
  const { getBalance } = useEntries(book.id);

  // Calculate the balance for this book
  const balance = getBalance();
  
  // Format the balance with proper currency formatting
  const formatBalance = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-IN').format(Math.abs(amount));
    return amount >= 0 ? formatted : `-${formatted}`;
  };
  
  // Get color based on balance
  const getBalanceColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  const handleRename = async () => {
    if (newName.trim() && newName.trim() !== book.name) {
      setIsProcessing('rename');
      try {
        await updateBook(book.id, { name: newName.trim() });
        setIsRenaming(false);
      } catch (error) {
        console.error('Failed to rename book:', error);
      } finally {
        setIsProcessing(null);
      }
    } else {
      setNewName(book.name);
      setIsRenaming(false);
    }
  };

  const handleDuplicate = async () => {
    setIsProcessing('duplicate');
    try {
      await duplicateBook(book.id);
    } catch (error) {
      console.error('Failed to duplicate book:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setIsProcessing('delete');
      try {
        await deleteBook(book.id);
      } catch (error) {
        console.error('Failed to delete book:', error);
      } finally {
        setIsProcessing(null);
      }
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/book/${book.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-150 group relative cursor-pointer"
      onClick={handleBookClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setNewName(book.name);
                    setIsRenaming(false);
                  }
                }}
                className="font-medium text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none w-full text-sm sm:text-base"
                autoFocus
              />
            ) : (
              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{book.name}</h3>
            )}
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {book.updated_at === book.created_at 
                ? `Created ${formatDistanceToNow(book.created_at)}`
                : `Updated ${formatDistanceToNow(book.updated_at)}`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className={`text-lg sm:text-2xl font-bold ${getBalanceColor(balance)}`}>
            {formatBalance(balance)}
          </div>
          
          {/* Action buttons - visible on hover */}
          <div className={`hidden sm:flex items-center space-x-1 transition-all duration-150 ${
            showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 sm:translate-x-2'
          }`}>
            <button
              onClick={() => setIsRenaming(true)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 ${
                isProcessing === 'rename' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Rename book"
              disabled={isProcessing === 'rename'}
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handleDuplicate}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 ${
                isProcessing === 'duplicate' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Duplicate book"
              disabled={isProcessing === 'duplicate'}
            >
              {isProcessing === 'duplicate' ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              title="Add member"
            >
              <Users className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handleDelete}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 ${
                isProcessing === 'delete' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Delete book"
              disabled={isProcessing === 'delete'}
            >
              {isProcessing === 'delete' ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-red-600" />
              )}
            </button>
          </div>
          
          {/* Mobile action menu */}
          <div className="sm:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Add Member</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}