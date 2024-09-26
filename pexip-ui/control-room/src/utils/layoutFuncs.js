import { LAYOUTS } from "../constants/constants";

export const getLayoutName = (index) => {
  let layout = LAYOUTS.LAYOUT_DEFAULT_VIDEO;

  switch (index) {
    case 0:
      layout = LAYOUTS.LAYOUT_DEFAULT_VIDEO;
      break;
    case 1:
      layout = LAYOUTS.LAYOUT_VIDEO_LARGE;
      break;
    case 2:
      layout = LAYOUTS.LAYOUT_SLIDE_LARGE;
      break;
    case 3:
      layout = LAYOUTS.LAYOUT_VIDEO_ONLY;
      break;
    case 4:
      layout = LAYOUTS.LAYOUT_SLIDE_ONLY;
      break;
    default:
      console.log(`error in getLayoutName function in media.jsx`);
      break;
  }

  return layout;
};

export const getLayoutIndex = (layoutName) => {
  let layout = 0;

  switch (layoutName) {
    case LAYOUTS.LAYOUT_DEFAULT_VIDEO:
      layout = 0;
      break;
    case LAYOUTS.LAYOUT_VIDEO_LARGE:
      layout = 1;
      break;
    case LAYOUTS.LAYOUT_SLIDE_LARGE:
      layout = 2;
      break;
    case LAYOUTS.LAYOUT_VIDEO_ONLY:
      layout = 3;
      break;
    case LAYOUTS.LAYOUT_SLIDE_ONLY:
      layout = 4;
      break;
    default:
      console.log(`error in getLayoutName function in media.jsx`);
      break;
  }

  return layout;
};
