export interface Difference {
  id: string;
  type: 'added' | 'removed' | 'changed';
  page: number;
  section: string;
  textA?: string;
  textB?: string;
  position: { x: number; y: number };
}

export interface CompareDocument {
  file: File;
  name: string;
  pages: number;
}
