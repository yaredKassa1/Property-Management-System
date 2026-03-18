'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Request } from '@/lib/types';

export default function RequestPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const id = params.id as string;
      const data: any = await api.getRequest(id);
      setRequest(data);
    } catch (err) {
      console.error('Failed to fetch request:', err);
      alert('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Request not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable, .printable * {
            visibility: visible;
          }
          .printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg printable">
          {/* Header */}
          <div className="border-b-4 border-blue-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Woldia University</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">Asset Request Form</h2>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p><span className="font-semibold">Request ID:</span> {request.id.substring(0, 8)}</p>
              </div>
              <div>
                <p><span className="font-semibold">Model:</span> 20</p>
                <p><span className="font-semibold">Date:</span> {new Date(request.requestDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="p-8 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-600">Request Type</label>
                <p className="mt-1 text-gray-900 capitalize">{request.requestType}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <p className="mt-1 text-gray-900 capitalize">{request.status.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Priority</label>
                <p className="mt-1 text-gray-900 capitalize">{request.priority}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Quantity</label>
                <p className="mt-1 text-gray-900">{request.quantity}</p>
              </div>
            </div>

            {/* Requester Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requester Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Name</label>
                  <p className="mt-1 text-gray-900">
                    {request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Work Unit</label>
                  <p className="mt-1 text-gray-900">{request.workUnit}</p>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
              <div>
                <label className="text-sm font-semibold text-gray-600">Item Name</label>
                <p className="mt-1 text-gray-900">{request.itemName}</p>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-600">Purpose</label>
                <p className="mt-1 text-gray-900">{request.purpose}</p>
              </div>
              {request.justification && (
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-600">Justification</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{request.justification}</p>
                </div>
              )}
            </div>

            {/* Approval Information */}
            {(request.status === 'approved' || request.status === 'completed') && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Approved By</label>
                    <p className="mt-1 text-gray-900">
                      {request.approver ? `${request.approver.firstName} ${request.approver.lastName}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Approval Date</label>
                    <p className="mt-1 text-gray-900">
                      {request.approvalDate ? new Date(request.approvalDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {request.permittedAmount !== undefined && request.permittedAmount !== null && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Permitted Amount</label>
                      <p className="mt-1 text-gray-900">{request.permittedAmount}</p>
                    </div>
                  )}
                  {request.approvalNotes && (
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Approval Notes</label>
                      <p className="mt-1 text-gray-900">{request.approvalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Information */}
            {request.status === 'completed' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Completed By</label>
                    <p className="mt-1 text-gray-900">
                      {request.completer ? `${request.completer.firstName} ${request.completer.lastName}` : 'Property Officer'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Completion Date</label>
                    <p className="mt-1 text-gray-900">
                      {request.completionDate ? new Date(request.completionDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signatures Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Signatures</h3>
              <div className="grid grid-cols-3 gap-8">
                {/* Requester Signature */}
                <div className="text-center">
                  <div className="border-b-2 border-gray-400 pb-16 mb-2">
                    {request.requesterSignature && (
                      <div className="text-gray-500 italic pt-12">{request.requesterSignature}</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Requestor Signature</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Approver Signature */}
                {(request.status === 'approved' || request.status === 'completed') && (
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 pb-16 mb-2">
                      {request.approverSignature && (
                        <div className="text-gray-500 italic pt-12">{request.approverSignature}</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Approval Authority Signature</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.approver ? `${request.approver.firstName} ${request.approver.lastName}` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {request.approvalDate ? new Date(request.approvalDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                )}

                {/* Property Officer Signature */}
                {request.status === 'completed' && (
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 pb-16 mb-2">
                      {request.completerSignature && (
                        <div className="text-gray-500 italic pt-12">{request.completerSignature}</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Property Officer Signature</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.completer ? `${request.completer.firstName} ${request.completer.lastName}` : 'Property Officer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {request.completionDate ? new Date(request.completionDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-600">
            <p>This is an official document from Woldia University Property Management System</p>
            <p className="mt-1">Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mt-6 flex justify-center space-x-4 no-print">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Print
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
