import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useBooks } from '../../hooks/useBooks';
import { Business } from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBusiness: Business | null;
}

export function AddBookModal({ isOpen, onClose, selectedBusiness }: AddBookModalProps) {
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createBook } = useBooks(selectedBusiness?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookName.trim()) {
      setError('Book name is required');
      return;
    }

    if (!selectedBusiness) {
      setError('Please select a business first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBook(bookName.trim(), selectedBusiness);
      setBookName('');
      
      // Small delay to ensure the book is properly created
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBookName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Book">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {selectedBusiness && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Business:</span> {selectedBusiness.name}
            </div>
          </div>
        )}

        <Input
          label="Book Name"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          placeholder="e.g. Daily Expense"
          required
          disabled={loading}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !bookName.trim() || !selectedBusiness}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}