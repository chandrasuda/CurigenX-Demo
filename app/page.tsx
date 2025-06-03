"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { DocumentStore, type Document, type UploadResponse } from "@/lib/document-store";
import { FileTextIcon, ListBulletIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await DocumentStore.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleUploadComplete = async (res: UploadResponse[]) => {
    if (res?.[0]?.serverData?.document) {
      const newDocument = res[0].serverData.document;
      try {
        await DocumentStore.addDocument(newDocument);
        // Redirect to the newly uploaded document
        router.push(`/documents/${newDocument.id}`);
      } catch (error) {
        console.error('Error storing document:', error);
      }
    }
  };

  const handleUploadError = (error: Error) => {
    alert(`Upload failed: ${error.message}`);
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
      {/* Hero Section */}
      <section className="w-full max-w-4xl flex flex-col items-center gap-4 mb-12 mt-8">
        <div className="flex flex-col items-center gap-2">
          <Badge variant="outline" className="border-black text-xs px-3 py-1 tracking-widest uppercase bg-white">
            For Pharma & Biotech
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight border-b-4 border-black pb-2 mb-2 inline-block">
            Curigenx
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-xl text-center">
            SaaS platform for regulatory, clinical, and medical writing teams. Automate and streamline QC of Clinical Study Reports (CSRs) for regulatory dossier accuracy, consistency, and scientific integrity.
          </p>
        </div>
        <div className="relative w-32 h-32 mt-6 mb-2">
          <img src="/globe.svg" alt="Technical Globe" className="w-full h-full object-contain opacity-70" />
          <span className="sr-only">Technical globe accent</span>
        </div>
      </section>

      <main className="flex flex-col items-center w-full max-w-4xl gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <Card className="border-black bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" />
                Upload New Document
              </h2>
              <UploadDropzone
                endpoint="pdfUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                appearance={{
                  container: "border-2 border-dashed border-gray-300 bg-white font-mono",
                  uploadIcon: "text-gray-400",
                  label: "text-sm text-gray-700 font-medium",
                  allowedContent: "text-xs text-gray-500",
                  button: "bg-black text-white border-black font-mono text-sm px-4 py-2"
                }}
              />
            </CardContent>
          </Card>
          <Card className="border-black bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ListBulletIcon className="w-5 h-5" />
                Your Documents
              </h2>
              {loading ? (
                <p className="text-gray-600 text-sm">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-gray-600 text-sm">No documents uploaded yet.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-3">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                  </p>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/documents/${doc.id}`}
                        className="block border border-gray-300 p-3 bg-white hover:bg-gray-50 transition-colors rounded-none"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileTextIcon className="w-4 h-4 text-gray-700" />
                          <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Minimal Footer/Tagline */}
      <footer className="w-full max-w-4xl mx-auto mt-16 mb-4 text-center border-t border-black pt-4 text-xs text-gray-500 font-mono">
        Ensuring scientific integrity & regulatory accuracy for every submission.
      </footer>
    </div>
  );
}
