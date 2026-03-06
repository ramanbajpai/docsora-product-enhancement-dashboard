import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DocumentWorkspace from "@/components/document/DocumentWorkspace";

interface DocumentViewerFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "mp4" | "jpg" | "png" | "folder";
  size?: number;
  pageCount?: number;
}

type UserRole = "owner" | "editor" | "viewer";

const DocumentViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file as DocumentViewerFile | undefined;
  const userRole = (location.state?.userRole as UserRole) || "owner"; // Default to owner for demo

  useEffect(() => {
    if (!file) {
      navigate("/storage");
    }
  }, [file, navigate]);

  if (!file) return null;

  const handleClose = () => {
    navigate("/storage");
  };

  const handleShare = () => {
    // Could open share modal or navigate to share settings
  };

  return (
    <DocumentWorkspace
      file={file}
      userRole={userRole}
      onClose={handleClose}
      onShare={handleShare}
    />
  );
};

export default DocumentViewer;
