import type BottomSheet from "@gorhom/bottom-sheet";
import type { Dispatch, SetStateAction } from "react";
import WebLocationMapParent from "./LocationMapParent.web";

type LocationMapParentProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  setShouldSessionStart: Dispatch<SetStateAction<boolean>>;
};

const LocationMapParent =
  WebLocationMapParent as React.ComponentType<LocationMapParentProps>;

export default LocationMapParent;
export { LocationMapParent };
