import type { UgcPost } from '@/types';
import { unsplash } from '@/config/media';

const ids = [
  '1524504388940-b1c1722653e1',
  '1544441893-675973e31985',
  '1529626455594-4ff0802cfb7e',
  '1500648767791-00dcc994a43e',
  '1531746020798-e6953c6e8e04',
  '1469334031218-e382a71b716b',
  '1507003211169-0a1dd7228f2d',
  '1534528741775-53994a69daeb',
];
const handles = ['@meera.wears', '@kabir.fits', '@rhea_in_red', '@dev.archive', '@tanvi.styles', '@sunny.daze', '@arjun.k', '@noor.edit'];

export const mockUgc: UgcPost[] = ids.map((id, i) => ({
  id: i + 1,
  handle: handles[i],
  image: unsplash(id, 600, 600),
  likes: 320 + ((i * 487) % 2100),
}));
