import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const BrandMark: React.FC<IconProps> = ({ size = 22, color = '#2E6B4E', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Geometric hexagon node representing distributed food verification */}
    <path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
    <path d="M12 6.5L17.5 9.7V14.3L12 17.5L6.5 14.3V9.7L12 6.5Z" stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.2" fill={color} />
    <line x1="12" y1="2" x2="12" y2="6.5" stroke={color} strokeWidth="1.2" />
    <line x1="21" y1="7.2" x2="17.5" y2="9.7" stroke={color} strokeWidth="1.2" />
    <line x1="21" y1="16.8" x2="17.5" y2="14.3" stroke={color} strokeWidth="1.2" />
    <line x1="12" y1="22" x2="12" y2="17.5" stroke={color} strokeWidth="1.2" />
    <line x1="3" y1="16.8" x2="6.5" y2="14.3" stroke={color} strokeWidth="1.2" />
    <line x1="3" y1="7.2" x2="6.5" y2="9.7" stroke={color} strokeWidth="1.2" />
  </svg>
);

export const IconCore: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <path d="M10 6.5H14M17.5 10V14M14 17.5H10M6.5 14V10" />
  </svg>
);

export const IconTrace: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M8.5 16L15.5 8.5" />
    <path d="M18 12V9H15" />
  </svg>
);

export const IconVerify: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3L20 6.5V12C20 17 16 20.5 12 21.5C8 20.5 4 17 4 12V6.5L12 3Z" />
    <path d="M9 12L11 14L15 10" />
  </svg>
);

export const IconIntelligence: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 19V14M8 19V10M13 19V6M18 19V12M22 19H2" />
    <path d="M3 13L8 9L13 5L18 11L22 7" />
  </svg>
);

export const IconFarmer: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 17V8M10 8C7.5 8 5 9.5 5 13M10 8C12.5 8 15 9.5 15 13" />
    <path d="M10 3C7 3 4 5 4 8C4 11 10 13 10 13C10 13 16 11 16 8C16 5 13 3 10 3Z" />
    <path d="M2 17H18" />
  </svg>
);

export const IconProcessor: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 17V9L8 6V11L13 8V13L17 11V17H3Z" />
    <circle cx="6" cy="14" r="1" fill={color} />
    <circle cx="10" cy="14" r="1" fill={color} />
    <circle cx="14" cy="14" r="1" fill={color} />
  </svg>
);

export const IconManufacturer: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="14" height="13" rx="1.5" />
    <path d="M7 4V17M13 4V17M3 10H17M7 7H9M11 7H13M7 13H9M11 13H13" />
  </svg>
);

export const IconTransport: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 5H12V14H2V5Z" />
    <path d="M12 8H15.5L18 11V14H12V8Z" />
    <circle cx="5.5" cy="15.5" r="1.5" />
    <circle cx="15" cy="15.5" r="1.5" />
  </svg>
);

export const IconRetailer: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7L10 3L17 7V17H3V7Z" />
    <path d="M8 17V11H12V17" />
    <path d="M3 7H17" />
  </svg>
);

export const IconConsumer: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="10" cy="6" r="3" />
    <path d="M4 16C4 13 6.5 11 10 11C13.5 11 16 13 16 16" />
  </svg>
);

export const IconRegulator: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2V18M4 6L10 4L16 6M4 6L2 12C2 13.5 3 14 4 14C5 14 6 13.5 6 12L4 6ZM16 6L14 12C14 13.5 15 14 16 14C17 14 18 13.5 18 12L16 6Z" />
    <path d="M7 18H13" />
  </svg>
);

export const IconQR: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="5" height="5" rx="0.75" />
    <rect x="12" y="3" width="5" height="5" rx="0.75" />
    <rect x="3" y="12" width="5" height="5" rx="0.75" />
    <path d="M12 12H13.5V13.5H12V12Z" fill={color} />
    <path d="M15.5 12H17V13.5H15.5V12Z" fill={color} />
    <path d="M12 15.5H13.5V17H12V15.5Z" fill={color} />
    <path d="M15.5 15.5H17V17H15.5V15.5Z" fill={color} />
  </svg>
);

export const IconShieldCheck: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2L17 5V10C17 14.5 13.5 17.5 10 18.5C6.5 17.5 3 14.5 3 10V5L10 2Z" />
    <path d="M7 10L9 12L13 8" />
  </svg>
);

export const IconGraph: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="5" cy="14" r="2" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="15" cy="14" r="2" />
    <path d="M6.5 13L13.5 7M6.5 14H13.5" />
  </svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 3L18 17H2L10 3Z" />
    <path d="M10 8V12M10 14.5V15" />
  </svg>
);

export const IconDatabase: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="10" cy="5" rx="7" ry="2.5" />
    <path d="M3 5V10C3 11.4 6.1 12.5 10 12.5C13.9 12.5 17 11.4 17 10V5" />
    <path d="M3 10V15C3 16.4 6.1 17.5 10 17.5C13.9 17.5 17 16.4 17 15V10" />
  </svg>
);
