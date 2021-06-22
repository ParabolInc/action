// Note: Not all weight variants of the expanded palette are available.
//       We only add variables when new variants are used in design.
//       As a design choice, we use constraint when adding weights from the expanded palette.
//       We try to only use the limited palette, but weighted variants
//       can help with subtle color changes in states like hover, or disabled.
//       The limited palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A366
//       The expanded palette is here:
//       https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A2184

export const enum PALETTE {
  AQUA_400 = '#55C0CF',

  FOREST_400 = '#73A153',

  FUSCIA_400 = '#DB70DB',

  GOLD_100 = '#FAEBD3',
  GOLD_200 = '#FADC9E',
  GOLD_300 = '#FFCC63',
  GOLD_500 = '#DE8E02',
  GOLD_700 = '#855000',

  GRADIENT_TOMATO_600_ROSE_500 = 'linear-gradient(to right, #F23B31 0, #ED4C86 100%)', // default: TOMATO_600 to ROSE_500
  GRADIENT_TOMATO_700_ROSE_600 = 'linear-gradient(to right, #D5211A 0, #EB195F 100%)', // hover: TOMATO_700 to ROSE_600
  GRADIENT_TOMATO_400_ROSE_300 = 'linear-gradient(to right, #FD7F77 0, #F099BF 100%)', // disabled: TOMATO_400 to ROSE_300

  GRAPE_500 = '#A06BD6',
  GRAPE_600 = '#7340B5',
  GRAPE_700 = '#493272',
  GRAPE_800 = '#2D1D53',

  GRASS_300 = '#C4CF66',

  JADE_400 = '#66BC8C',

  LILAC_500 = '#7272E5',

  ROSE_500 = '#ED4C86',

  SKY_300 = '#8EC7F1',
  SKY_400 = '#61B1EB',
  SKY_500 = '#329AE5',
  SKY_600 = '#14649E',

  SLATE_100 = '#F8F7FC',
  SLATE_200 = '#F1F0FA',
  SLATE_300 = '#E0DDEC',
  SLATE_400 = '#C3C0D8',
  SLATE_500 = '#A7A3C2',
  SLATE_600 = '#82809A',
  SLATE_700 = '#444258',
  SLATE_800 = '#2D2D39',
  SLATE_900 = '#1C1C21',

  SLATE_700_30 = '#4442584D', // SLATE_700 at 30% opacity
  SLATE_700_80 = '#444258CD', // SLATE_700 at ~80% opacity
  SLATE_900_32 = '#1C1C2152', // SLATE_900 at 32% opacity

  TERRA_300 = '#FE975D',
  TERRA_500 = '#D35D22',

  TOMATO_100 = '#FFE2E0',
  TOMATO_200 = '#FFC1BD',
  TOMATO_500 = '#FD6157',
  TOMATO_600 = '#F23B31',
  TOMATO_700 = '#D5211A',
  TOMATO_800 = '#9F201E',

  WHITE = '#FFFFFF'
}
