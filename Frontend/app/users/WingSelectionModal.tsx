'use client';

import { Button } from '@/components/ui/Button';

interface WingSelectionModalProps {
  onSelectWing: (wing: 'academic' | 'administrative') => void;
  onClose: () => void;
}

export function WingSelectionModal({ onSelectWing, onClose }: WingSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Select User Wing</h2>
          <p className="text-gray-600 mb-6">Choose which wing this user belongs to:</p>
          
          <div className="space-y-3">
            <button
              onClick={() => onSelectWing('academic')}
              className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="font-semibold text-gray-900">Academic Wing</div>
              <div className="text-sm text-gray-600">Colleges, Schools, and Departments</div>
            </button>
            
            <button
              onClick={() => onSelectWing('administrative')}
              className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="font-semibold text-gray-900">Administrative Wing</div>
              <div className="text-sm text-gray-600">Administrative Units and Offices</div>
            </button>
          </div>

          <Button type="button" variant="secondary" onClick={onClose} className="w-full mt-6">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
