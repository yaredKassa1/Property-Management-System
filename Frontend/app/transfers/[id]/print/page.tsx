'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';

interface TransferDetail {
  id: string;
  referenceNumber: string;
  transferDate: string;
  assetId: string;
  assetName: string;
  assetDescription: string;
  tagNumber: string;
  serialNumber: string;
  chassisNumber: string;
  engineNumber: string;
  uom: string;
  unit: number;
  originalCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  remark: string;
  fromArea: string;
  fromBuilding: string;
  fromFloor: string;
  fromDetailLocation: string;
  fromEmployeeName: string;
  fromEmployeeId: string;
  fromDepartment: string;
  toArea: string;
  toBuilding: string;
  toFloor: string;
  toDetailLocation: string;
  toEmployeeName: string;
  toEmployeeId: string;
  toDepartment: string;
  requestedBy: string;
  approvedBy: string;
  status: string;
  transferorSignature?: string;
  recipientSignature?: string;
  propertyOfficerSignature?: string;
  approvalDate?: string;
  completionDate?: string;
  completedByName?: string;
}

export default function TransferPrintPage() {
  const params = useParams();
  const pathname = usePathname();
  const [transfer, setTransfer] = useState<TransferDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Params:', params);
    console.log('Pathname:', pathname);
    
    // Extract ID from params or pathname
    let transferId = params?.id as string;
    
    // Fallback: extract from pathname if params.id is not available
    if (!transferId && pathname) {
      const matches = pathname.match(/\/transfers\/([^\/]+)\/print/);
      if (matches && matches[1]) {
        transferId = matches[1];
        console.log('Extracted ID from pathname:', transferId);
      }
    }
    
    if (transferId) {
      console.log('Loading transfer with ID:', transferId);
      loadTransferDetails(transferId);
    } else {
      console.error('No transfer ID found in params or pathname');
      setLoading(false);
    }
  }, [params, pathname]);

  const loadTransferDetails = async (transferId: string) => {
    if (!transferId) {
      console.error('No transfer ID provided');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching transfer with ID:', transferId);
      // Fetch real transfer data from the API
      const response = await api.getTransferById(transferId);
      console.log('API Response:', response);
      
      const transferData = response?.data || response;
      console.log('Transfer Data:', transferData);
      
      if (!transferData || !transferData.id) {
        throw new Error('Invalid transfer data received');
      }
      
      // Transform the backend data to match our interface
      const transformedTransfer: TransferDetail = {
        id: transferData.id,
        referenceNumber: transferData.referenceNumber || `TR-${transferData.id.substring(0, 8)}`,
        transferDate: new Date(transferData.requestDate || transferData.createdAt).toLocaleDateString('en-GB'),
        assetId: transferData.asset?.assetId || '',
        // Add signature fields
        transferorSignature: transferData.transferorSignature,
        recipientSignature: transferData.recipientSignature,
        propertyOfficerSignature: transferData.propertyOfficerSignature,
        approvalDate: transferData.approvalDate,
        completionDate: transferData.completionDate,
        completedByName: transferData.completer ? `${transferData.completer.firstName} ${transferData.completer.middleName || ''} ${transferData.completer.lastName}`.trim() : '',
        assetName: transferData.asset?.name || '',
        assetDescription: transferData.asset?.description || transferData.asset?.name || '',
        tagNumber: transferData.asset?.tagNumber || transferData.asset?.assetId || '',
        serialNumber: transferData.asset?.serialNumber || '',
        chassisNumber: transferData.asset?.chassisNumber || '',
        engineNumber: transferData.asset?.engineNumber || '',
        uom: transferData.asset?.uom || 'Unit',
        unit: transferData.asset?.quantity || 1,
        originalCost: transferData.asset?.purchasePrice || 0,
        accumulatedDepreciation: transferData.asset?.accumulatedDepreciation || 0,
        bookValue: transferData.asset?.bookValue || (transferData.asset?.purchasePrice || 0),
        remark: transferData.notes || '',
        fromArea: transferData.fromWorkUnit || transferData.fromUser?.workUnit || '',
        fromBuilding: transferData.fromBuilding || '',
        fromFloor: transferData.fromFloor || '',
        fromDetailLocation: transferData.fromLocation || transferData.asset?.location || '',
        fromEmployeeName: transferData.fromUser ? 
          `${transferData.fromUser.firstName || ''} ${transferData.fromUser.middleName || ''} ${transferData.fromUser.lastName || ''}`.trim().toUpperCase() : '',
        fromEmployeeId: transferData.fromUser?.username || transferData.fromUser?.id || '',
        fromDepartment: transferData.fromWorkUnit || transferData.fromUser?.workUnit || '',
        toArea: transferData.toWorkUnit || transferData.toUser?.workUnit || '',
        toBuilding: transferData.toBuilding || '',
        toFloor: transferData.toFloor || '',
        toDetailLocation: transferData.toLocation || '',
        toEmployeeName: transferData.toUser ? 
          `${transferData.toUser.firstName || ''} ${transferData.toUser.middleName || ''} ${transferData.toUser.lastName || ''}`.trim().toUpperCase() : '',
        toEmployeeId: transferData.toUser?.username || transferData.toUser?.id || '',
        toDepartment: transferData.toWorkUnit || transferData.toUser?.workUnit || '',
        requestedBy: transferData.requester ? 
          `${transferData.requester.firstName || ''} ${transferData.requester.middleName || ''} ${transferData.requester.lastName || ''}`.trim() : '',
        approvedBy: transferData.approver ? 
          `${transferData.approver.firstName || ''} ${transferData.approver.middleName || ''} ${transferData.approver.lastName || ''}`.trim() : '',
        status: transferData.status
      };
      
      setTransfer(transformedTransfer);
    } catch (error) {
      console.error('Failed to load transfer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Transfer not found</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none">
          {/* Print Button - Hidden when printing */}
          <div className="no-print mb-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Transfer Form
            </button>
          </div>

          {/* Main Form */}
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/woldia-logo.jpg" 
                  alt="Woldia University Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold">Woldia University</h1>
                <h2 className="text-lg font-semibold">Fixed Asset Management Unit (FAMU)</h2>
                <h3 className="text-base font-semibold">Fixed Asset Internal Transfer Form</h3>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">Model21</p>
              </div>
            </div>

            <hr className="border-t-2 border-black mb-6" />

            {/* Form Details */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                <div className="col-span-2">
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <label className="font-semibold">Name of Institution</label>
                      <p className="mt-1">Woldia University</p>
                    </div>
                    <div className="w-48">
                      <label className="font-semibold">No:</label>
                      <p className="mt-1">{transfer.referenceNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right col-span-2">
                  <label className="font-semibold">Date:</label>
                  <span className="ml-2">{transfer.transferDate}</span>
                </div>
              </div>

              {/* Transfer Details Table */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                {/* Transferred From */}
                <div>
                  <h4 className="font-bold mb-3">Transferred From</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold w-40">Area:</span>
                      <span>{transfer.fromArea}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Building:</span>
                      <span>{transfer.fromBuilding}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Floor:</span>
                      <span>{transfer.fromFloor}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Detail Location:</span>
                      <span>{transfer.fromDetailLocation}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Staff Name:</span>
                      <span>{transfer.fromEmployeeName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Staff ID:</span>
                      <span>{transfer.fromEmployeeId}</span>
                    </div>
                  </div>
                </div>

                {/* Transferred To */}
                <div>
                  <h4 className="font-bold mb-3">Transferred To</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold w-40">Area:</span>
                      <span>{transfer.toArea}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Building:</span>
                      <span>{transfer.toBuilding}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Floor:</span>
                      <span>{transfer.toFloor}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Detail Location:</span>
                      <span>{transfer.toDetailLocation}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Staff Name:</span>
                      <span>{transfer.toEmployeeName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Staff ID:</span>
                      <span>{transfer.toEmployeeId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Details Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-400 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-2 py-2 text-left">S. No</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Asset Description</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Tag Number</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Serial Number</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Chassis Number</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Engine Number</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">UOM</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Unit</th>
                      <th className="border border-gray-400 px-2 py-2 text-right">Original Cost</th>
                      <th className="border border-gray-400 px-2 py-2 text-right">Accumulated Depreciation</th>
                      <th className="border border-gray-400 px-2 py-2 text-right">Book Value</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 px-2 py-2">1</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.assetName}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.tagNumber}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.serialNumber}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.chassisNumber}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.engineNumber}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.uom}</td>
                      <td className="border border-gray-400 px-2 py-2 text-center">{transfer.unit}</td>
                      <td className="border border-gray-400 px-2 py-2 text-right">{transfer.originalCost.toFixed(2)}</td>
                      <td className="border border-gray-400 px-2 py-2 text-right">{transfer.accumulatedDepreciation.toFixed(2)}</td>
                      <td className="border border-gray-400 px-2 py-2 text-right">{transfer.bookValue.toFixed(2)}</td>
                      <td className="border border-gray-400 px-2 py-2">{transfer.remark}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certification Statement */}
              <div className="mb-8 mt-8">
                <p className="text-sm italic">
                  I the undersigned recipient, hereby, certify that I have correctly counted and received the items listed above.
                </p>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                {/* Transferor Signature */}
                <div>
                  <h4 className="font-bold mb-8 text-center">Transferor Name and Signature</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{transfer.fromEmployeeName}</span>
                      </div>
                      <label className="text-xs text-gray-500">Name</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1 min-h-[32px] flex items-end">
                        {(transfer as any).transferorSignature && (
                          <img 
                            src={(transfer as any).transferorSignature} 
                            alt="Transferor Signature" 
                            className="max-h-8 max-w-full object-contain"
                          />
                        )}
                      </div>
                      <label className="text-xs text-gray-500">Signature</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{transfer.transferDate}</span>
                      </div>
                      <label className="text-xs text-gray-500">Date</label>
                    </div>
                  </div>
                </div>

                {/* Recipient Signature */}
                <div>
                  <h4 className="font-bold mb-8 text-center">Recipient Name and Signature</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{transfer.toEmployeeName}</span>
                      </div>
                      <label className="text-xs text-gray-500">Name</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1 min-h-[32px] flex items-end">
                        {(transfer as any).recipientSignature && (
                          <img 
                            src={(transfer as any).recipientSignature} 
                            alt="Recipient Signature" 
                            className="max-h-8 max-w-full object-contain"
                          />
                        )}
                      </div>
                      <label className="text-xs text-gray-500">Signature</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{(transfer as any).approvalDate ? new Date((transfer as any).approvalDate).toLocaleDateString('en-GB') : ''}</span>
                      </div>
                      <label className="text-xs text-gray-500">Date</label>
                    </div>
                  </div>
                </div>

                {/* Property Officer Signature */}
                <div>
                  <h4 className="font-bold mb-8 text-center">Property Officer</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{(transfer as any).completedByName || ''}</span>
                      </div>
                      <label className="text-xs text-gray-500">Name</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1 min-h-[32px] flex items-end">
                        {(transfer as any).propertyOfficerSignature && (
                          <img 
                            src={(transfer as any).propertyOfficerSignature} 
                            alt="Property Officer Signature" 
                            className="max-h-8 max-w-full object-contain"
                          />
                        )}
                      </div>
                      <label className="text-xs text-gray-500">Signature</label>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-1">
                        <span className="text-sm text-gray-600">{(transfer as any).completionDate ? new Date((transfer as any).completionDate).toLocaleDateString('en-GB') : ''}</span>
                      </div>
                      <label className="text-xs text-gray-500">Date</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
