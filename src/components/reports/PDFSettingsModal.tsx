import { ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ReportSettings } from '../../types';

interface PDFSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReportSettings;
  onSettingsChange: (settings: ReportSettings) => void;
}

export function PDFSettingsModal({ isOpen, onClose, settings, onSettingsChange }: PDFSettingsModalProps) {
  const handleColumnChange = (column: keyof ReportSettings['columns'], checked: boolean) => {
    onSettingsChange({
      ...settings,
      columns: {
        ...settings.columns,
        [column]: checked
      }
    });
  };

  const handleOtherOptionChange = (option: keyof ReportSettings['otherOptions'], checked: boolean) => {
    onSettingsChange({
      ...settings,
      otherOptions: {
        ...settings.otherOptions,
        [option]: checked
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">PDF Settings</h2>
        </div>

        {/* Column Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select columns you wish to include in "All Entries"
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.date}
                onChange={(e) => handleColumnChange('date', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Date</div>
                <div className="text-xs text-gray-500">Compulsory</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.cashIn}
                onChange={(e) => handleColumnChange('cashIn', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Cash In</div>
                <div className="text-xs text-gray-500">Compulsory</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.cashOut}
                onChange={(e) => handleColumnChange('cashOut', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Cash Out</div>
                <div className="text-xs text-gray-500">Compulsory</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.balance}
                onChange={(e) => handleColumnChange('balance', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Balance</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.category}
                onChange={(e) => handleColumnChange('category', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Category</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.remark}
                onChange={(e) => handleColumnChange('remark', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Remark</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.paymentModes}
                onChange={(e) => handleColumnChange('paymentModes', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Payment Modes</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.attachments}
                onChange={(e) => handleColumnChange('attachments', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Attachments</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.voice}
                onChange={(e) => handleColumnChange('voice', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Voice</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.members}
                onChange={(e) => handleColumnChange('members', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Members</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.contact}
                onChange={(e) => handleColumnChange('contact', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Contact</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.columns.time}
                onChange={(e) => handleColumnChange('time', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Time</div>
              </div>
            </label>
          </div>
        </div>

        {/* Custom Fields */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Fields</h3>
          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="font-medium text-gray-900">abc</div>
          </label>
        </div>

        {/* Other Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Other Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.otherOptions.userNameAndNumber}
                onChange={(e) => handleOtherOptionChange('userNameAndNumber', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="font-medium text-gray-900">User Name & Number</div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={settings.otherOptions.appliedFilters}
                onChange={(e) => handleOtherOptionChange('appliedFilters', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="font-medium text-gray-900">Applied Filters</div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Save PDF Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}