/**
 * Custom hook for managing Terraform operation logs
 */

import { useCallback, useRef, useState } from 'react';
import type { LogsPanelOperation, DeployStatus } from '../types';

interface UseTerraformLogsOptions {
  onStatusChange?: (status: DeployStatus) => void;
}

export function useTerraformLogs(options: UseTerraformLogsOptions = {}) {
  const [terraformLogs, setTerraformLogs] = useState<string[]>([]);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [logsPanelOperation, setLogsPanelOperation] = useState<LogsPanelOperation>(null);
  const [logsPanelStatus, setLogsPanelStatus] = useState<DeployStatus>('idle');
  const [planPreviewContent, setPlanPreviewContent] = useState('');

  const planEventSourceRef = useRef<EventSource | null>(null);
  const deployEventSourceRef = useRef<EventSource | null>(null);

  const appendTerraformLogs = useCallback(
    (lines: string | string[], appendOptions?: { includePreview?: boolean }) => {
      const entries = Array.isArray(lines) ? lines : [lines];
      const flattened = entries.flatMap((raw) => {
        if (typeof raw !== 'string') return [];
        return raw.split('\n').map((line) => line.replace(/\r/g, ''));
      });

      if (flattened.length === 0) return;

      setTerraformLogs((prev) => [...prev, ...flattened]);

      if (appendOptions?.includePreview === false) return;

      const previewEligible = flattened.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('PLAN_RESULT:')) return false;
        if (trimmed === '[DONE]') return false;
        if (trimmed.startsWith('>')) return false;
        if (trimmed.startsWith('[INFO]')) return false;
        return true;
      });

      if (previewEligible.length === 0) return;

      const joined = previewEligible.join('\n');
      setPlanPreviewContent((prev) => (prev ? `${prev}\n${joined}` : joined));
    },
    []
  );

  const appendDeployLogs = useCallback((lines: string | string[]) => {
    const entries = Array.isArray(lines) ? lines : [lines];
    const flattened = entries.flatMap((raw) => {
      if (typeof raw !== 'string') return [];
      return raw.split('\n').map((line) => line.replace(/\r/g, ''));
    });

    if (flattened.length === 0) return;

    setDeployLogs((prev) => [...prev, ...flattened]);
  }, []);

  const clearLogs = useCallback(() => {
    setTerraformLogs([]);
    setDeployLogs([]);
    setPlanPreviewContent('');
  }, []);

  const stopPlanStream = useCallback(() => {
    if (planEventSourceRef.current) {
      planEventSourceRef.current.close();
      planEventSourceRef.current = null;
    }
  }, []);

  const stopDeployStream = useCallback(() => {
    if (deployEventSourceRef.current) {
      deployEventSourceRef.current.close();
      deployEventSourceRef.current = null;
    }
  }, []);

  const openLogsPanel = useCallback((operation: LogsPanelOperation) => {
    setLogsPanelOperation(operation);
    setLogsPanelOpen(true);
    setLogsPanelStatus('running');
  }, []);

  const closeLogsPanel = useCallback(() => {
    setLogsPanelOpen(false);
  }, []);

  const updateLogsPanelStatus = useCallback(
    (status: DeployStatus) => {
      setLogsPanelStatus(status);
      options.onStatusChange?.(status);
    },
    [options]
  );

  return {
    // State
    terraformLogs,
    deployLogs,
    logsPanelOpen,
    logsPanelOperation,
    logsPanelStatus,
    planPreviewContent,

    // Refs for stream management
    planEventSourceRef,
    deployEventSourceRef,

    // Actions
    appendTerraformLogs,
    appendDeployLogs,
    clearLogs,
    stopPlanStream,
    stopDeployStream,
    openLogsPanel,
    closeLogsPanel,
    updateLogsPanelStatus,
    setLogsPanelStatus,
    setTerraformLogs,
    setDeployLogs,
    setPlanPreviewContent,
    setLogsPanelOpen,
    setLogsPanelOperation,
  };
}
