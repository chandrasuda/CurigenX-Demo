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
import { FileTextIcon, ListBulletIcon, HomeIcon, TrashIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function DocumentViewPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
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

  const handleIndexDocument = async () => {
    if (!document) return;
    
    setIndexing(true);
    
    // Simulate document analysis/indexing
    setTimeout(async () => {
      const mockAnalysis = {
        pageCount: Math.floor(Math.random() * 20) + 5,
        tableOfContents: [
          {
            page: 1,
            title: "Introduction",
            keywords: ["introduction", "overview", "summary"]
          },
          {
            page: 3,
            title: "Methodology",
            keywords: ["method", "approach", "process"]
          },
          {
            page: 8,
            title: "Results",
            keywords: ["findings", "data", "analysis"]
          },
          {
            page: 12,
            title: "Conclusion",
            keywords: ["conclusion", "summary", "results"]
          }
        ]
      };

      try {
        await DocumentStore.updateDocumentAnalysis(document.id, mockAnalysis);
        const updatedDoc = await DocumentStore.getDocument(document.id);
        if (updatedDoc) {
          setDocument(updatedDoc);
        }
      } catch (error) {
        console.error('Error updating document analysis:', error);
      } finally {
        setIndexing(false);
      }
    }, 2000);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* PDF Viewer Section */}
              <div className="md:col-span-2 border border-black p-4 flex flex-col bg-gray-50">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold">Document Viewer</h2>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(document.size)}
                  </div>
                </div>
                <div className="flex-grow overflow-auto bg-white shadow-inner">
                  <iframe
                    src={document.url}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              </div>

              {/* Analysis Section */}
              <div className="md:col-span-1 border border-black p-4 flex flex-col bg-gray-50">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
                  <ListBulletIcon className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold">Content Analysis</h2>
                </div>
                <div className="flex-grow overflow-auto space-y-3 p-1">
                  <div className="text-sm space-y-2">
                    <div className="p-3 border border-gray-300 bg-white">
                      <h3 className="font-medium text-sm mb-1">Document Info</h3>
                      <p className="text-xs text-gray-600">Name: {document.name}</p>
                      <p className="text-xs text-gray-600">Size: {formatFileSize(document.size)}</p>
                      <p className="text-xs text-gray-600">
                        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                      {document.analysis?.pageCount && (
                        <p className="text-xs text-gray-600">Pages: {document.analysis.pageCount}</p>
                      )}
                    </div>

                    {document.analysis?.tableOfContents ? (
                      document.analysis.tableOfContents.map((item, index) => (
                        <div key={index} className="p-3 border border-dashed border-gray-300 bg-white">
                          <h3 className="font-medium text-sm mb-1">Page {item.page}: {item.title}</h3>
                          <p className="text-xs text-gray-600">Keywords: {item.keywords.join(', ')}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 border border-dashed border-gray-300 bg-white">
                        <p className="text-sm text-gray-700">
                          Analysis will appear here after indexing.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  className="mt-4 w-full" 
                  onClick={handleIndexDocument}
                  disabled={indexing}
                >
                  {indexing ? 'Indexing...' : 'Index Document'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 