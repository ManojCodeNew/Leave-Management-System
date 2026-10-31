export const formatDuration = (days: number): string => {
  if (days <= 0) return '0 Days';
  return days === 1 ? '1 Day' : `${days} Days`;
};

export const getStatusVariant = (
  status: string
): 'pending' | 'approved' | 'rejected' => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'PENDING':
    default:
      return 'pending';
  }
};

