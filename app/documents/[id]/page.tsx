"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { DocumentStore, type Document } from "@/lib/document-store";
import { HomeIcon, TrashIcon, FileTextIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import TabbedPdfViewer from "@/components/tabbed-pdf-viewer";

export default function DocumentViewPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await DocumentStore.getDocument(documentId);
        if (!doc) {
          router.push('/documents');
          return;
        }
        setDocument(doc);
      } catch (error) {
        console.error('Error loading document:', error);
        router.push('/documents');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId, router]);



  const handleDeleteDocument = async () => {
    if (!document) return;
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const success = await DocumentStore.deleteDocument(document.id);
      if (success) {
        router.push('/documents');
      } else {
        alert('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('An error occurred while deleting the document.');
    } finally {
      setDeleting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-black font-mono">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-black font-mono">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileTextIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Document not found</h2>
              <p className="text-gray-600 mb-6">The requested document could not be located.</p>
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/documents">Back to Documents</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-black font-mono">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                  <HomeIcon className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/documents" className="hover:text-gray-700 transition-colors">Documents</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-700 truncate max-w-xs">{document.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <main className="flex flex-col w-full">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 break-words">{document.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Size: {((document.size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button variant="outline" asChild>
                  <Link href="/documents">Back to Library</Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDeleteDocument}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button asChild className="bg-black text-white hover:bg-gray-800">
                  <Link href="/">Upload New</Link>
                </Button>
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white" style={{ height: 'calc(100vh - 240px)' }}>
              <TabbedPdfViewer 
                document={document} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 