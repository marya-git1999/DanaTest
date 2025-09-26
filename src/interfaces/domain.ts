export interface Domain {
  id: number;
  domain: string;
  status: 1 | 2 | 3;
  isActive: boolean;
  createdDate: string;
}
