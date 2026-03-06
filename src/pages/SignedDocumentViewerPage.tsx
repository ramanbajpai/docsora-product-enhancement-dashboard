import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignedDocumentViewer } from "@/components/signing-flow/SignedDocumentViewer";

interface SignedDocumentViewerState {
  document?: {
    id: string;
    name: string;
    type?: string;
    size?: number;
  };
  allowDownload?: boolean;
  allowShare?: boolean;
  showWatermark?: boolean;
}

const SignedDocumentViewerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignedDocumentViewerState | undefined;

  useEffect(() => {
    // If no state provided, redirect back
    if (!state?.document) {
      navigate("/track");
    }
  }, [state, navigate]);

  if (!state?.document) return null;

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <SignedDocumentViewer
      onClose={handleClose}
      allowDownload={state.allowDownload ?? true}
      allowShare={state.allowShare ?? false}
      showWatermark={state.showWatermark ?? true}
    />
  );
};

export default SignedDocumentViewerPage;
