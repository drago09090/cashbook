import React, { useState } from 'react';
import { Trash2, Edit, Play, Pause, Paperclip, Eye } from 'lucide-react';
import { Entry } from '../../types';
import { formatCurrencyINR } from '../../utils/dateUtils';

interface EntryTableProps {
  entries: Entry[];
  selectedEntries: string[];
  onSelectionChange: (entryIds: string[]) => void;
  onDeleteEntry: (entryId: string) => void;
  onEditEntry: (entry: Entry) => void;
}

interface VoicePlayerProps {
  audioUrl: string;
  entryId: string;
}

function VoicePlayer({ audioUrl, entryId }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(audioUrl));

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  // Handle audio end
  audio.onended = () => {
    setIsPlaying(false);
  };

  return (
    <button
      onClick={togglePlay}
      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
      title={isPlaying ? 'Pause voice recording' : 'Play voice recording'}
    >
      {isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span className="text-xs">Voice</span>
    </button>
  );
}

interface AttachmentsViewerProps {
  attachments: string[];
  entryId: string;
}

function AttachmentsViewer({ attachments, entryId }: AttachmentsViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

  const handleViewAttachment = (attachment: string) => {
    setSelectedAttachment(attachment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAttachment(null);
  };

  if (attachments.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <>
      <div className="flex items-center space-x-1">
        <Paperclip className="w-4 h-4 text-gray-500" />
        <button
          onClick={() => handleViewAttachment(attachments[0])}
          className="text-blue-600 hover:text-blue-800 text-xs"
          title="View attachments"
        >
          {attachments.length} file{attachments.length > 1 ? 's' : ''}
        </button>
      </div>

      {/* Attachment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((attachment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{attachment}</p>
                        <p className="text-sm text-gray-500">Attachment {index + 1}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          // In a real app, this would open/download the file
                          alert(`Opening ${attachment}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EntryTable({ 
  entries, 
  selectedEntries, 
  onSelectionChange, 
  onDeleteEntry,
  onEditEntry
}: EntryTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(entries.map(entry => entry.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEntries, entryId]);
    } else {
      onSelectionChange(selectedEntries.filter(id => id !== entryId));
    }
  };

  const isAllSelected = entries.length > 0 && selectedEntries.length === entries.length;
  const isIndeterminate = selectedEntries.length > 0 && selectedEntries.length < entries.length;

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No entries found. Add your first cash entry to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Mode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remarks
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Voice
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attachments
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedEntries.includes(entry.id)}
                  onChange={(e) => handleSelectEntry(entry.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    entry.type === 'cash_in'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {entry.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatCurrencyINR(entry.amount)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {entry.contact_name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {entry.category || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {entry.payment_mode || 'Cash'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                <div className="truncate" title={entry.remarks || '-'}>
                  {entry.remarks || '-'}
                </div>
              </td>
              <td className="px-4 py-3">
                {entry.voice_recording ? (
                  <VoicePlayer audioUrl={entry.voice_recording} entryId={entry.id} />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <AttachmentsViewer 
                  attachments={entry.attachments || []} 
                  entryId={entry.id} 
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit entry"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}