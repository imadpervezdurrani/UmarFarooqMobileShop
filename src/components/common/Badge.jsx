import React from 'react';

export const Badge = ({ children, variant = 'secondary', icon: Icon }) => {
  const getVariantClass = (v) => {
    switch (v) {
      case 'emerald':
      case 'PTA Approved':
      case 'Paid':
      case 'In Stock':
        return 'badge-emerald';
      case 'amber':
      case 'CPID':
      case 'Partial':
      case 'Low Stock':
      case 'Pending':
        return 'badge-amber';
      case 'rose':
      case 'Non-PTA':
      case 'Unpaid':
      case 'Out of Stock':
        return 'badge-rose';
      case 'violet':
      case 'JV':
        return 'badge-violet';
      case 'cyan':
      case 'OEM':
      case 'Online':
      case 'Cash':
        return 'badge-cyan';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <span className={`badge ${getVariantClass(variant)}`}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
};
