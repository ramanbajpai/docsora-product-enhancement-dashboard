import { 
  RotateCw, Scissors, Layers, Trash2, GitCompare, Lock, 
  FileOutput, FileDown, Droplets, ArrowUpDown, FileText, Wrench, Edit,
  LucideIcon
} from "lucide-react";

export type UploadMode = 'single' | 'multi';

export interface ToolConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  readyTitle: string;
  description: string;
  hint?: string;
  icon: LucideIcon;
  acceptMultiple: boolean;
  supportedFormats: string[];
  uploadMode: UploadMode;
  minFiles?: number; // Minimum files required to proceed
  maxFiles?: number; // Maximum files allowed
  minFilesMessage?: string; // Message when minimum not met
}

export const toolConfigs: Record<string, ToolConfig> = {
  rotate: {
    id: "rotate",
    name: "Rotate",
    title: "Rotate PDF",
    subtitle: "Rotate pages to any orientation — 90°, 180°, or custom angles.",
    readyTitle: "Ready to rotate",
    description: "Rotate pages to any orientation",
    icon: RotateCw,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  split: {
    id: "split",
    name: "Split",
    title: "Split PDF",
    subtitle: "Break your document into precise parts or individual pages.",
    readyTitle: "Ready to split",
    description: "Break into precise parts",
    icon: Scissors,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  merge: {
    id: "merge",
    name: "Merge",
    title: "Merge PDFs",
    subtitle: "Combine multiple documents into one seamless file.",
    readyTitle: "Ready to merge",
    description: "Combine into one document",
    icon: Layers,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
    minFiles: 2,
    minFilesMessage: "Upload at least 2 documents to merge.",
  },
  delete: {
    id: "delete",
    name: "Delete Pages",
    title: "Delete Pages",
    subtitle: "Remove unwanted pages from your document.",
    readyTitle: "Ready to delete pages",
    description: "Remove unwanted pages",
    icon: Trash2,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  compare: {
    id: "compare",
    name: "Compare",
    title: "Compare PDFs",
    subtitle: "Spot differences between two documents instantly.",
    readyTitle: "Ready to compare",
    description: "Spot differences instantly",
    hint: "Upload two files to compare",
    icon: GitCompare,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
    minFiles: 2,
    maxFiles: 2,
    minFilesMessage: "Upload 2 documents to compare.",
  },
  protect: {
    id: "protect",
    name: "Protect",
    title: "Protect PDF",
    subtitle: "Encrypt your document with a secure password.",
    readyTitle: "Ready to protect",
    description: "Encrypt with password",
    icon: Lock,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  extract: {
    id: "extract",
    name: "Extract",
    title: "Extract Pages",
    subtitle: "Pull specific pages into a new document.",
    readyTitle: "Ready to extract",
    description: "Pull specific pages",
    icon: FileOutput,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  flatten: {
    id: "flatten",
    name: "PDF to One Page",
    title: "PDF to One Page",
    subtitle: "Your document will be condensed into a single page.",
    readyTitle: "Ready to convert to one page",
    description: "Condense to streamlined view",
    icon: FileDown,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  watermark: {
    id: "watermark",
    name: "Watermark",
    title: "Add Watermark",
    subtitle: "Apply custom text or image watermarks to your pages.",
    readyTitle: "Ready to watermark",
    description: "Add custom watermarks",
    icon: Droplets,
    acceptMultiple: false,
    supportedFormats: ['PDF'],
    uploadMode: 'single',
  },
  organize: {
    id: "organize",
    name: "Organize",
    title: "Organize Pages",
    subtitle: "Reorder, rotate, and arrange pages freely.",
    readyTitle: "Ready to organize",
    description: "Reorder pages freely",
    icon: ArrowUpDown,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  metadata: {
    id: "metadata",
    name: "Metadata",
    title: "Edit Metadata",
    subtitle: "Inspect, edit, or remove hidden document information and properties.",
    readyTitle: "Ready to edit metadata",
    description: "Edit or remove metadata",
    icon: FileText,
    acceptMultiple: false,
    supportedFormats: ['PDF'],
    uploadMode: 'single',
  },
  repair: {
    id: "repair",
    name: "Repair",
    title: "Repair PDF",
    subtitle: "Fix corrupted or damaged PDF files.",
    readyTitle: "Ready to repair",
    description: "Fix corrupted files",
    icon: Wrench,
    acceptMultiple: true,
    supportedFormats: ['PDF'],
    uploadMode: 'multi',
  },
  edit: {
    id: "edit",
    name: "Edit PDF",
    title: "Edit PDF",
    subtitle: "Add text, images, and annotations to your document.",
    readyTitle: "Ready to edit",
    description: "Add text and images",
    icon: Edit,
    acceptMultiple: false,
    supportedFormats: ['PDF'],
    uploadMode: 'single',
  },
};

export const getToolConfig = (toolId: string): ToolConfig | undefined => {
  return toolConfigs[toolId];
};

export const getAllTools = (): ToolConfig[] => {
  return Object.values(toolConfigs);
};
