export interface User {
  id: string;
  deviceName: string;
  deviceId?: string; // Optional for backward compatibility
  platform?: string; // Device platform (iOS, Android, Web)
}
