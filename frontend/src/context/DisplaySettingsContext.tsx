import { createContext, useContext, ReactNode } from 'react';

export interface DisplaySettings {
  showNodeTitles: boolean;
  showConnectors: boolean;
  showConnectorLabels: boolean;
  animateConnectorLine: boolean;
  animateConnectorCircles: boolean;
}

const defaultSettings: DisplaySettings = {
  showNodeTitles: true,
  showConnectors: true,
  showConnectorLabels: true,
  animateConnectorLine: false,
  animateConnectorCircles: false,
};

const DisplaySettingsContext = createContext<DisplaySettings>(defaultSettings);

export function DisplaySettingsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: DisplaySettings;
}) {
  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings(): DisplaySettings {
  return useContext(DisplaySettingsContext);
}
