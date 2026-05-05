export enum Platform {
  PC = 'PC',
  Mobile = 'Mobile',
  Xbox = 'Xbox',
  PS = 'PS'
}

export interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  imageUrl: string;
  videoUrl?: string;
  downloadUrl?: string;
  platform: Platform;
  category: string;
  ram?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Purchase {
  id: string;
  userId: string;
  userEmail?: string;
  gameId: string;
  gameTitle?: string;
  amount: number;
  purchasedAt: any;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  isAdmin?: boolean;
  purchasedGameIds: string[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
