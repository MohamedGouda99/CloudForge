/**
 * Custom hook for managing project data and persistence
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import apiClient from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/store/authStore';
import type { Project, CloudCredentials, DeployStatus, DeployMode } from '../types';
import { sanitizeNodeForSave, sanitizeEdgeForSave, decorateEdges } from '../utils/nodeHelpers';

interface UseDesignerProjectOptions {
  projectId: string | undefined;
  onLoadComplete?: (project: Project) => void;
}

export function useDesignerProject({ projectId, onLoadComplete }: UseDesignerProjectOptions) {
  const { token } = useAuthStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<CloudCredentials | null>(null);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');
  const [deployMode, setDeployMode] = useState<DeployMode>('apply');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialLoadRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);
  const deployHistoryLoadedRef = useRef(false);

  const provider = project?.cloud_provider || 'aws';

  // Load deployment history from localStorage on mount
  useEffect(() => {
    if (!projectId || deployHistoryLoadedRef.current) return;

    try {
      const stored = localStorage.getItem(`deploy_history_${projectId}`);
      if (stored) {
        const history = JSON.parse(stored);
        if (history.status && history.status !== 'running') {
          setDeployStatus(history.status);
          setDeployMode(history.mode === 'deploy' ? 'apply' : history.mode || 'apply');
          setDeployLogs(history.logs || []);
        }
      }
      deployHistoryLoadedRef.current = true;
    } catch (e) {
      // Ignore errors loading history
    }
  }, [projectId]);

  // Save deployment history to localStorage when it changes
  useEffect(() => {
    if (!projectId || deployStatus === 'idle' || deployStatus === 'running') return;

    try {
      const history = {
        status: deployStatus,
        mode: deployMode,
        logs: deployLogs.slice(-50),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`deploy_history_${projectId}`, JSON.stringify(history));
    } catch (e) {
      // Ignore errors saving history
    }
  }, [projectId, deployStatus, deployMode, deployLogs]);

  // Load project data
  const loadProject = useCallback(async () => {
    if (!projectId || !token) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loadedProject = response.data as Project;
      setProject(loadedProject);
      onLoadComplete?.(loadedProject);

      // Load stored credentials
      try {
        const storedCreds = localStorage.getItem(`credentials_${loadedProject.cloud_provider}`);
        if (storedCreds) {
          setCredentials(JSON.parse(storedCreds));
        }
      } catch (e) {
        // Ignore errors loading credentials
      }

      hasInitialLoadRef.current = true;
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [projectId, token, onLoadComplete]);

  // Save project diagram
  const saveProject = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!projectId || !token || !project || isSavingRef.current) return;

      const sanitizedNodes = nodes.map(sanitizeNodeForSave);
      const sanitizedEdges = edges.map(sanitizeEdgeForSave);
      const newData = JSON.stringify({ nodes: sanitizedNodes, edges: sanitizedEdges });

      // Skip if no changes
      if (newData === lastSavedDataRef.current) return;

      try {
        isSavingRef.current = true;
        setSaving(true);

        await apiClient.put(
          `/api/projects/${projectId}`,
          {
            name: project.name,
            description: project.description,
            cloud_provider: project.cloud_provider,
            diagram_data: { nodes: sanitizedNodes, edges: sanitizedEdges },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        lastSavedDataRef.current = newData;
      } catch (error) {
        // Handle error
      } finally {
        isSavingRef.current = false;
        setSaving(false);
      }
    },
    [projectId, token, project]
  );

  // Schedule auto-save
  const scheduleAutoSave = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        saveProject(nodes, edges);
      }, 2000);
    },
    [saveProject]
  );

  // Get region config from credentials
  const getRegionConfig = useCallback(() => {
    const creds =
      credentials ||
      (() => {
        try {
          const stored = localStorage.getItem(`credentials_${provider}`);
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      })();

    if (!creds) return {};

    const config: Record<string, string> = {};

    if (provider === 'aws') {
      if (creds.aws_region) config.aws_region = creds.aws_region;
      if (creds.aws_endpoint_url) config.aws_endpoint_url = creds.aws_endpoint_url;
    } else if (provider === 'azure' && creds.azure_location) {
      config.azure_location = creds.azure_location;
    } else if (provider === 'gcp') {
      if (creds.gcp_region) config.gcp_region = creds.gcp_region;
      if (creds.gcp_project_id) config.gcp_project = creds.gcp_project_id;
    }

    return config;
  }, [credentials, provider]);

  // Update credentials
  const updateCredentials = useCallback(
    (newCredentials: CloudCredentials) => {
      setCredentials(newCredentials);
      try {
        localStorage.setItem(`credentials_${provider}`, JSON.stringify(newCredentials));
      } catch (e) {
        // Ignore storage errors
      }
    },
    [provider]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    project,
    loading,
    saving,
    credentials,
    deployStatus,
    deployMode,
    deployLogs,
    provider,

    // Actions
    loadProject,
    saveProject,
    scheduleAutoSave,
    getRegionConfig,
    updateCredentials,
    setProject,
    setDeployStatus,
    setDeployMode,
    setDeployLogs,

    // Refs
    hasInitialLoadRef,
  };
}
