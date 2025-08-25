import * as enterpriseContent from './content-enterprise';
import * as personalContent from './content-personal';

export type WaitlistVariant = 'enterprise' | 'personal';

export const getContentForVariant = (variant: WaitlistVariant) => {
  switch (variant) {
    case 'personal':
      return personalContent;
    case 'enterprise':
    default:
      return enterpriseContent;
  }
};