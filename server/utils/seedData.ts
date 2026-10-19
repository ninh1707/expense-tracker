/** Compatibility entry point for the legacy seed utility.
 * Uses the non-destructive demo initializer instead of deleting existing data.
 */
import { AuthService } from '../services/authService';

export const seedDatabase = async (): Promise<void> => {
  await AuthService.seedDemoUser();
};
