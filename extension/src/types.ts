export enum MainCategory {
  MAKEUP = 'Makeup',
  SKINCARE = 'Skincare',
  HAIRCARE = 'Haircare',
  BODYCARE = 'Bodycare',
  FRAGRANCE = 'Fragrance',
  NAILCARE = 'Nailcare',
  TOOLS = 'Tools',
  OTHER = 'Other'
}

export interface CategoryNode {
  name: string;
  children?: { [key: string]: CategoryNode };
}

export interface CategoryPath {
  name: string;
  level: 'main' | 'sub' | 'detail';
}

export interface ProductPreview {
  name: string;
  brand: string;
  price?: number;
  mainCategory?: MainCategory;
  imageUrl?: string;
  purchaseLink?: string;
}

// Category tree data structure
export const CategoryTree: { [key in MainCategory]: { [key: string]: CategoryNode } } = {
  [MainCategory.MAKEUP]: {
    'Lips': {
      name: 'Lips',
      children: {
        'Lipstick': {
          name: 'Lipstick',
          children: {
            'Matte': { name: 'Matte' },
            'Cream': { name: 'Cream' },
            'Liquid': { name: 'Liquid' },
            'Metallic': { name: 'Metallic' }
          }
        },
        'Lip Liner': {
          name: 'Lip Liner',
          children: {
            'Pencil': { name: 'Pencil' },
            'Liquid': { name: 'Liquid' }
          }
        },
        'Lip Care': {
          name: 'Lip Care',
          children: {
            'Balm': { name: 'Balm' },
            'Scrub': { name: 'Scrub' },
            'Mask': { name: 'Mask' }
          }
        }
      }
    },
    'Eyes': {
      name: 'Eyes',
      children: {
        'Eyeshadow': {
          name: 'Eyeshadow',
          children: {
            'Palette': { name: 'Palette' },
            'Single': { name: 'Single' },
            'Cream': { name: 'Cream' },
            'Liquid': { name: 'Liquid' }
          }
        },
        'Eyeliner': {
          name: 'Eyeliner',
          children: {
            'Pencil': { name: 'Pencil' },
            'Liquid': { name: 'Liquid' },
            'Gel': { name: 'Gel' }
          }
        }
      }
    }
  },
  [MainCategory.SKINCARE]: {
    'Cleansers': {
      name: 'Cleansers',
      children: {
        'Face Wash': {
          name: 'Face Wash',
          children: {
            'Gel': { name: 'Gel' },
            'Cream': { name: 'Cream' },
            'Foam': { name: 'Foam' },
            'Oil': { name: 'Oil' }
          }
        }
      }
    }
  },
  [MainCategory.HAIRCARE]: {},
  [MainCategory.BODYCARE]: {},
  [MainCategory.FRAGRANCE]: {},
  [MainCategory.NAILCARE]: {},
  [MainCategory.TOOLS]: {},
  [MainCategory.OTHER]: {}
};
