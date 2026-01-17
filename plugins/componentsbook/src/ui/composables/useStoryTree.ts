import { ref, computed } from 'vue';
import { useApi } from '../../context';
import type { StoryFile } from '../../types';

export interface FileTreeNode {
  name: string;
  fullPath: string;
  isFile: boolean;
  children: FileTreeNode[];
  file?: StoryFile;
}

export function useStoryTree() {
  const api = useApi();
  const files = ref<StoryFile[]>([]);
  const isFileListLoading = ref(false);

  // Логика построения дерева
  const buildFileTree = (files: StoryFile[]): FileTreeNode[] => {
    if (files.length === 0) return [];

    const root: FileTreeNode = {
      name: '',
      fullPath: '',
      isFile: false,
      children: [],
    };

    files.forEach((file) => {
      const normalizedPath = file.path.replace(/^src\//, '');
      const parts = normalizedPath.split('/').filter(Boolean);

      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;

        let child = current.children.find((node) => node.name === part);
        if (!child) {
          const childFullPath = current.fullPath
            ? `${current.fullPath}/${part}`
            : part;
          child = {
            name: part,
            fullPath: childFullPath,
            isFile,
            children: [],
          };
          if (isFile) {
            child.file = file;
          }
          current.children.push(child);
        }
        current = child;
      }
    });

    const sortTree = (nodes: FileTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
        return a.isFile ? 1 : -1;
      });
      for (const node of nodes) {
        sortTree(node.children);
      }
    };

    sortTree(root.children);
    return root.children;
  };

  const tree = computed(() => buildFileTree(files.value));

  const loadFiles = async () => {
    isFileListLoading.value = true;
    try {
      files.value = await api.rpc.call<StoryFile[]>('componentsbook:get-files');
    } catch (e) {
      console.error('[componentsbook] Error loading files:', e);
      api.notify('Failed to load story files', 'error');
    } finally {
      isFileListLoading.value = false;
    }
  };

  return { files, tree, isFileListLoading, loadFiles };
}
