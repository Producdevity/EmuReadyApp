// Base Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  profileImage: string | null;
  role: 'USER' | 'AUTHOR' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
}

export interface Game {
  id: string;
  title: string;
  imageUrl: string | null;
  boxartUrl: string | null;
  bannerUrl: string | null;
  system: System;
  tgdbGameId: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date | null;
  submitter: User | null;
}

export interface System {
  id: string;
  name: string;
  key: string | null;
  tgdbPlatformId: number | null;
}

export interface Device {
  id: string;
  modelName: string;
  brand: DeviceBrand;
  soc: SoC | null;
}

export interface DeviceBrand {
  id: string;
  name: string;
}

export interface SoC {
  id: string;
  name: string;
  manufacturer: string;
  architecture: string | null;
  processNode: string | null;
  cpuCores: number | null;
  gpuModel: string | null;
}

export interface Emulator {
  id: string;
  name: string;
  logo: string | null;
  systems: System[];
}

export interface PerformanceScale {
  id: string;
  label: string;
  rank: number;
  description: string | null;
}

export interface Listing {
  id: string;
  game: Game;
  device: Device;
  emulator: Emulator;
  performance: PerformanceScale;
  author: User | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  userVote: 'UP' | 'DOWN' | null;
  successRate: number;
  _count: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  userVote: 'UP' | 'DOWN' | null;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeaturedListingsResponse {
  listings: Listing[];
  totalCount: number;
  successRate: number;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'listing/[id]': { id: string };
  'game/[id]': { id: string };
  'user/[id]': { id: string };
  'auth/login': undefined;
  'auth/register': undefined;
};

export type TabParamList = {
  index: undefined;
  browse: undefined;
  create: undefined;
  profile: undefined;
};

// Form Types
export interface CreateListingForm {
  gameId: string;
  deviceId: string;
  emulatorId: string;
  performanceId: string;
  customFields?: Record<string, any>;
}

export interface SearchFilters {
  query?: string;
  systemId?: string;
  deviceId?: string;
  emulatorId?: string;
  performanceRank?: number;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'performance';
}

// Store Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    comments: boolean;
    votes: boolean;
  };
  defaultFilters: SearchFilters;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
} 