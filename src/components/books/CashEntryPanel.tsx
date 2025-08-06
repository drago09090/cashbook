import { useState, useRef } from 'react';
import { X, Calendar, Clock, Mic, MicOff, Paperclip, Plus, Settings, ChevronDown, Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useEntries } from '../../hooks/useEntries';

interface CustomField {
  id: string;
  name: string;
  required: boolean;
  value: string;
}

interface CashEntryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cash-in' | 'cash-out';
  bookId: string;
}

export function CashEntryPanel({ isOpen, onClose, type, bookId }: CashEntryPanelProps) {
  const { createEntry } = useEntries(bookId);
  const [activeTab, setActiveTab] = useState(type);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const categories = {
    'cash-in': ['Salary', 'Sale', 'Bonus', 'Income From Rent', 'Profit'],
    'cash-out': ['Office Expense', 'Travel', 'Food', 'Utilities', 'Rent', 'Supplies']
  };

  const paymentModes = ['Cash', 'Online', 'PhonePe', 'Paytm', 'Bank Transfer', 'Credit Card'];

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url); // In production, you'd upload this to a server
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
      const newField: CustomField = {
        id: Date.now().toString(),
        name: newFieldName.trim(),
        required: newFieldRequired,
        value: ''
      };
      setCustomFields(prev => [...prev, newField]);
      setNewFieldName('');
      setNewFieldRequired(false);
      setShowCustomFieldModal(false);
    }
  };

  const updateCustomField = (id: string, value: string) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };

  const resetForm = () => {
    setAmount('');
    setContactName('');
    setRemarks('');
    setCategory('');
    setAttachedFiles([]);
    setRecordedAudio(null);
    setCustomFields(prev => prev.map(field => ({ ...field, value: '' })));
  };

  const handleSaveEntry = async (addNew: boolean) => {
    if (!amount.trim()) {
      alert('Amount is required');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        type: activeTab === 'cash-in' ? 'cash_in' as const : 'cash_out' as const,
        amount: parseFloat(amount),
        contact_name: contactName,
        remarks,
        category,
        payment_mode: paymentMode,
        date,
        time,
        attachments: attachedFiles.map(file => file.name), // In production, you'd upload files and store URLs
        voice_recording: recordedAudio,
        custom_fields: customFields.reduce((acc, field) => ({
          ...acc,
          [field.name]: field.value
        }), {})
      };

      await createEntry(entryData);
      
      if (addNew) {
        resetForm();
      } else {
        // Small delay to ensure the entry is properly created
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => handleSaveEntry(false);
  const handleSaveAndAddNew = () => handleSaveEntry(true);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Add {activeTab === 'cash-in' ? 'Cash In' : 'Cash Out'} Entry
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Tab Switcher */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('cash-in')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'cash-in'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cash In
              </button>
              <button
                onClick={() => setActiveTab('cash-out')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'cash-out'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cash Out
              </button>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 890 or 100 + 200*3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Search or Select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remarks with Voice Recording */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <div className="relative">
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
                  rows={3}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              {recordedAudio && (
                <div className="mt-2">
                  <audio controls src={recordedAudio} className="w-full h-8" />
                  <button
                    onClick={() => {
                      setRecordedAudio(null);
                    }}
                    className="mt-1 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove recording
                  </button>
                </div>
              )}
            </div>

            {/* Category and Payment Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
                  >
                    <span className={category || 'text-gray-400'}>
                      {category || 'Select'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2">Suggestions</div>
                        {categories[activeTab].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <div className="relative">
                  <button
                    onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
                  >
                    <span>{paymentMode}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showPaymentDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="p-2">
                        {paymentModes.map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              setPaymentMode(mode);
                              setShowPaymentDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Attach Bills</span>
              </button>
              <p className="text-xs text-gray-500 mt-1">Attach up to 4 images or PDF files</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileAttach}
                className="hidden"
              />
              {attachedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Fields */}
            {customFields.map((field) => (
              <div key={field.id} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateCustomField(field.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeCustomField(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Fields */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCustomFieldModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="text-sm">Add more fields</span>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">New</span>
              </button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={handleSaveAndAddNew}
                disabled={loading}
                className={`flex-1 ${activeTab === 'cash-in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? 'Saving...' : 'Save & Add New'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Field Modal */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Custom Field</h3>
              <button
                onClick={() => setShowCustomFieldModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Field Name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Bill no"
              />
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="required-field"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="required-field" className="text-sm text-gray-700">
                  Required Field? <span className="text-gray-500">(This field will be optional to add when creating entry)</span>
                </label>
              </div>

              <div className="flex justify-end">
                <Button onClick={addCustomField} disabled={!newFieldName.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}