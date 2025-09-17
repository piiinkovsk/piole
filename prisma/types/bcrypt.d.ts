// Declaration file for bcrypt module
declare module 'bcrypt' {
  export function genSalt(rounds?: number): Promise<string>;
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  
  // Sync versions
  export function genSaltSync(rounds?: number): string;
  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string;
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
}
