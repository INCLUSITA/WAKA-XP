/**
 * Shared DataMode context — extracted for sub-components
 */
import { createContext, useContext } from "react";

export type DataMode = "libre" | "subventionné" | "zero-rated";

export const DataModeContext = createContext<DataMode>("libre");

export function useDataMode(): DataMode {
  return useContext(DataModeContext);
}
