import { useState, useCallback } from "react";
import { StorageFile } from "@/pages/Storage";

export interface DragState {
  isDragging: boolean;
  draggedFiles: StorageFile[];
  hoveredDropTarget: string | null; // "root" | folder id | null
}

export const useDragAndDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedFiles: [],
    hoveredDropTarget: null,
  });

  const startDrag = useCallback((files: StorageFile[]) => {
    setDragState({
      isDragging: true,
      draggedFiles: files,
      hoveredDropTarget: null,
    });
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedFiles: [],
      hoveredDropTarget: null,
    });
  }, []);

  const setHoveredTarget = useCallback((targetId: string | null) => {
    setDragState(prev => ({
      ...prev,
      hoveredDropTarget: targetId,
    }));
  }, []);

  const isValidDropTarget = useCallback((targetId: string | null, targetType: "folder" | "root") => {
    const { draggedFiles } = dragState;
    if (draggedFiles.length === 0) return false;
    
    // Can't drop on self
    if (draggedFiles.some(f => f.id === targetId)) return false;
    
    // Can't drop folder into itself
    if (targetType === "folder" && draggedFiles.some(f => f.type === "folder" && f.id === targetId)) {
      return false;
    }
    
    return true;
  }, [dragState]);

  return {
    dragState,
    startDrag,
    endDrag,
    setHoveredTarget,
    isValidDropTarget,
  };
};
