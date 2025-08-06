import { useState, useRef } from 'react';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
}

export function BulkImportModal({ isOpen, onClose, bookId, bookName }: BulkImportModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState(1); // 1: File selection, 2: Header mapping, 3: Preview
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (selectedFile) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const downloadSampleFile = () => {
    const sampleData = `Date,Type,Amount,Contact Name,Remarks,Category,Payment Mode
2024-01-15,Cash In,5000,John Doe,Sale of products,Sale,Cash
2024-01-16,Cash Out,1200,ABC Suppliers,Office supplies,Office Expense,Online
2024-01-17,Cash In,3500,Jane Smith,Consulting fee,Service,Bank Transfer`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cashbook_sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Import Entries <span className="text-gray-500 font-normal">({user?.full_name || 'User'})</span>
              </h1>
            </div>
          </div>
          <div className="text-sm text-blue-600">
            Premium Trial Feature • <span className="text-blue-500 hover:underline cursor-pointer">Learn More</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            {/* File Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select a CSV file <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleChooseFile}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Choose File
                  </button>
                  <span className="text-gray-600">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Sample File Download */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Download Sample File</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your CSV file should have same columns as this sample file
                  </p>
                  <button
                    onClick={downloadSampleFile}
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Select Header And Preview Entries →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {/* Header Mapping Section */}
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Header Mapping</h3>
              <p className="text-gray-600 mb-6">
                Map your CSV columns to CashBook fields
              </p>
              <p className="text-sm text-gray-500">
                Selected file: {selectedFile?.name}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Preview Entries →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            {/* Preview Section */}
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview & Import</h3>
              <p className="text-gray-600 mb-6">
                Review your entries before importing
              </p>
              <p className="text-sm text-gray-500">
                Ready to import entries from: {selectedFile?.name}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <Button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700"
              >
                Import Entries
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}