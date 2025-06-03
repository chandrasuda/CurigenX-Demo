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
import { HomeIcon, TrashIcon } from "@radix-ui/react-icons";
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
      <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg mb-4">Document not found</p>
              <Button asChild>
                <Link href="/documents">Back to Documents</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
      <div className="w-full max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <HomeIcon className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/documents">Documents</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{document.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <main className="flex flex-col items-center w-full gap-6">
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold truncate">{document.name}</h1>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/documents">Back to Documents</Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDeleteDocument}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button asChild>
                  <Link href="/">Upload New</Link>
                </Button>
              </div>
            </div>

            <div className="border border-black h-[calc(100vh-200px)]">
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