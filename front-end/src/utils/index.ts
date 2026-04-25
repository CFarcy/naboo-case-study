export * from './global.styles';
export * from './mantine.theme';

export interface City {
  nom: string;
  code?: string;
  codeDepartement?: string;
  codeRegion?: string;
  codesPostaux?: string[];
  population?: number;
}
