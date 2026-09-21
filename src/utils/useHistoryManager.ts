import { useState, useRef, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { MorphConfig, MorphShape, StateSnapshot, HistoryItem, HistoryManagerInfo } from '../types';
import { 
  createStateSnapshot, 
  isMeaningfullyDifferent, 
  MAX_HISTORY_STACK_DEPTH, 
  describeConfigChange,
  cloneConfig
} from './historyManager';
import { deserializeMorphShape } from './presetManager';

export interface UseHistoryManagerOptions {
  config: MorphConfig;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  shapes: MorphShape[];
  setConfig: Dispatch<SetStateAction<MorphConfig>>;
  setSourceShapeId: (id: string) => void;
  setTargetShapeId: (id: string) => void;
  setWaypointShapeIds: (ids: string[]) => void;
  setShapes: Dispatch<SetStateAction<MorphShape[]>>;
  onShowToast?: (message: string) => void;
}

export function useHistoryManager({
  config,
  sourceShapeId,
  targetShapeId,
  waypointShapeIds,
  shapes,
  setConfig,
  setSourceShapeId,
  setTargetShapeId,
  setWaypointShapeIds,
  setShapes,
  onShowToast,
}: UseHistoryManagerOptions) {
  const pastRef = useRef<StateSnapshot[]>([]);
  const futureRef = useRef<StateSnapshot[]>([]);
  const presentRef = useRef<StateSnapshot>(
    createStateSnapshot(sourceShapeId, targetShapeId, waypointShapeIds, config, shapes, '초기 상태 (Default Scene)')
  );

  // State to drive UI re-renders
  const [historyInfo, setHistoryInfo] = useState<HistoryManagerInfo>(() => ({
    canUndo: false,
    canRedo: false,
    undoCount: 0,
    redoCount: 0,
    lastPastDescription: undefined,
    nextFutureDescription: undefined,
    historyList: [
      {
        id: presentRef.current.id,
        timestamp: presentRef.current.timestamp,
        description: presentRef.current.description,
        isCurrent: true,
      },
    ],
  }));

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef<boolean>(false);

  const updateHistoryState = useCallback(() => {
    const past = pastRef.current;
    const future = futureRef.current;
    const present = presentRef.current;

    const list: HistoryItem[] = [
      ...past.map((s) => ({
        id: s.id,
        timestamp: s.timestamp,
        description: s.description,
        isCurrent: false,
      })),
      {
        id: present.id,
        timestamp: present.timestamp,
        description: present.description,
        isCurrent: true,
      },
      ...[...future].reverse().map((s) => ({
        id: s.id,
        timestamp: s.timestamp,
        description: s.description,
        isCurrent: false,
      })),
    ];

    setHistoryInfo({
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      undoCount: past.length,
      redoCount: future.length,
      lastPastDescription: past.length > 0 ? past[past.length - 1].description : undefined,
      nextFutureDescription: future.length > 0 ? future[future.length - 1].description : undefined,
      historyList: list,
    });
  }, []);

  /**
   * Applies a snapshot back to active React state.
   */
  const applySnapshot = useCallback((snap: StateSnapshot) => {
    isRestoringRef.current = true;

    // 1. Restore Custom Shapes if any
    if (snap.customShapes && snap.customShapes.length > 0) {
      const restored = snap.customShapes.map((s) => deserializeMorphShape(s));
      setShapes((prev) => {
        const existingMap = new Map(prev.map((s) => [s.id, s]));
        restored.forEach((r) => {
          if (!existingMap.has(r.id)) {
            existingMap.set(r.id, r);
          }
        });
        return Array.from(existingMap.values());
      });
    }

    // 2. Restore Source, Target, Waypoints
    if (snap.sourceShapeId) setSourceShapeId(snap.sourceShapeId);
    if (snap.targetShapeId) setTargetShapeId(snap.targetShapeId);
    setWaypointShapeIds([...(snap.waypointShapeIds || [])]);

    // 3. Restore Config (preserving playback state and live progress)
    setConfig((prev) => ({
      ...cloneConfig(snap.config),
      progress: prev.progress,
      isPlaying: prev.isPlaying,
    }));

    setTimeout(() => {
      isRestoringRef.current = false;
    }, 50);
  }, [setConfig, setShapes, setSourceShapeId, setTargetShapeId, setWaypointShapeIds]);

  /**
   * Immediately records a discrete action as a new history snapshot.
   */
  const recordAction = useCallback(
    (
      description: string,
      customParams?: {
        config?: MorphConfig;
        sourceShapeId?: string;
        targetShapeId?: string;
        waypointShapeIds?: string[];
        shapes?: MorphShape[];
      }
    ) => {
      if (isRestoringRef.current) return;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const activeSrc = customParams?.sourceShapeId ?? sourceShapeId;
      const activeDst = customParams?.targetShapeId ?? targetShapeId;
      const activeWaypoints = customParams?.waypointShapeIds ?? waypointShapeIds ?? [];
      const activeConfig = customParams?.config ?? config;
      const activeShapes = customParams?.shapes ?? shapes ?? [];

      const newSnap = createStateSnapshot(
        activeSrc,
        activeDst,
        activeWaypoints,
        activeConfig,
        activeShapes,
        description
      );

      if (!isMeaningfullyDifferent(presentRef.current, newSnap)) {
        return;
      }

      pastRef.current.push(presentRef.current);
      if (pastRef.current.length > MAX_HISTORY_STACK_DEPTH) {
        pastRef.current.shift();
      }

      futureRef.current = [];
      presentRef.current = newSnap;

      updateHistoryState();
    },
    [config, shapes, sourceShapeId, targetShapeId, updateHistoryState, waypointShapeIds]
  );

  /**
   * Debounced recording for continuous slider dragging and color tweaking.
   */
  const recordConfigChangeDebounced = useCallback(
    (patch: Partial<MorphConfig>, nextConfig: MorphConfig) => {
      if (isRestoringRef.current) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const desc = describeConfigChange(patch);

      debounceTimerRef.current = setTimeout(() => {
        const newSnap = createStateSnapshot(
          sourceShapeId,
          targetShapeId,
          waypointShapeIds || [],
          nextConfig,
          shapes || [],
          desc
        );

        if (isMeaningfullyDifferent(presentRef.current, newSnap)) {
          pastRef.current.push(presentRef.current);
          if (pastRef.current.length > MAX_HISTORY_STACK_DEPTH) {
            pastRef.current.shift();
          }
          futureRef.current = [];
          presentRef.current = newSnap;
          updateHistoryState();
        }
      }, 350);
    },
    [shapes, sourceShapeId, targetShapeId, updateHistoryState, waypointShapeIds]
  );

  /**
   * Reverts to the previous snapshot in the history stack.
   */
  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const previousSnap = pastRef.current.pop()!;
    futureRef.current.push(presentRef.current);

    presentRef.current = previousSnap;
    applySnapshot(previousSnap);
    updateHistoryState();

    if (onShowToast) {
      onShowToast(`↩️ 실행 취소 (Undo): ${previousSnap.description}`);
    }

    return previousSnap;
  }, [applySnapshot, onShowToast, updateHistoryState]);

  /**
   * Re-applies the next undone snapshot in the forward stack.
   */
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const nextSnap = futureRef.current.pop()!;
    pastRef.current.push(presentRef.current);

    presentRef.current = nextSnap;
    applySnapshot(nextSnap);
    updateHistoryState();

    if (onShowToast) {
      onShowToast(`↪️ 다시 실행 (Redo): ${nextSnap.description}`);
    }

    return nextSnap;
  }, [applySnapshot, onShowToast, updateHistoryState]);

  /**
   * Clears the history stack.
   */
  const clearHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    updateHistoryState();
    if (onShowToast) {
      onShowToast('🗑️ 스냅샷 히스토리 스택이 초기화되었습니다.');
    }
  }, [onShowToast, updateHistoryState]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Meta+Z, Meta+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    ...historyInfo,
    recordAction,
    recordConfigChangeDebounced,
    undo,
    redo,
    clearHistory,
  };
}
