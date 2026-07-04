import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { apiPost, getRfq } from '../../lib/api';
import Swal from 'sweetalert2';

interface PRActionsProps {
  request: any;
  user: any;
  activeCompany: any;
  onUpdate: (updatedRequest: any) => void;
}

export function PRActions({ request, user, activeCompany, onUpdate }: PRActionsProps) {
  const isOwner = activeCompany?.owner_id === user?.id;
  const isManager = user?.role === "manager" || isOwner;
  const isBuyerRole = user?.role === "buyer";
  const isBuyerComp = activeCompany?.type === "buyer";
  
  // Only show approve/reject buttons for managers or owners (never buyers), and only when status is pending_approval
  // Buyers should never see these buttons regardless of company type
  if (request.status !== "pending_approval" || isBuyerRole || (!isManager)) {
    return null;
  }

  const handleReject = async () => {
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Please log in again to reject this PR.'
      });
      return;
    }
    
    // Show rejection reason dialog
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Purchase Request',
      html: `
        <p style="margin-bottom: 16px; color: #6b7280;">Please provide a reason for rejecting this PR:</p>
        <textarea 
          id="rejection-reason" 
          class="swal2-textarea" 
          placeholder="Enter rejection reason (optional)..."
          style="min-height: 80px; resize: vertical; width: 100%; box-sizing: border-box;"
        ></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject PR',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const textarea = document.getElementById('rejection-reason') as HTMLTextAreaElement;
        return textarea?.value || '';
      }
    });

    if (!isConfirmed) return;

    try {
      await apiPost(`/api/rfqs/${request.id}/reject`, { 
        reason: reason || null
      });
      
      Swal.fire({
        icon: 'success',
        title: 'PR Rejected',
        text: 'Purchase Request has been rejected successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Reload detail to show updated status
      const updatedResponse = await getRfq(request.id);
      onUpdate(updatedResponse?.rfq ?? updatedResponse?.data ?? updatedResponse);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to reject PR. Check permissions.'
      });
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    
    try {
      await apiPost(`/api/rfqs/${request.id}/approve`, {});
      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: '✓ PR Approved & Published as Global RFQ.',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Reload detail
      const updatedResponse = await getRfq(request.id);
      onUpdate(updatedResponse?.rfq ?? updatedResponse?.data ?? updatedResponse);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve. Check permissions.'
      });
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <button
        onClick={handleReject}
        style={{
          flex: 1, 
          padding: "10px", 
          borderRadius: 10,
          background: "transparent", 
          border: "2px solid #ef4444", 
          color: "#ef4444", 
          fontWeight: 800,
          fontSize: 12, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 6
        }}
      >
        <XCircle size={14} /> Reject PR
      </button>
      
      <button
        onClick={handleApprove}
        style={{
          flex: 2, 
          padding: "10px", 
          borderRadius: 10,
          background: "#22c55e", 
          border: "none", 
          color: "#fff", 
          fontWeight: 800,
          fontSize: 12, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 6
        }}
      >
        <CheckCircle2 size={14} /> Approve & Publish PR
      </button>
    </div>
  );
}