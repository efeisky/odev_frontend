import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import { Button, Card, CardContent } from "../components/ProjectDetailComponents";
import {
  AiFillFilePdf,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFileImage,
  AiFillFile,
} from "react-icons/ai";
import { SiJavascript, SiHtml5, SiCss3, SiTypescript } from "react-icons/si";
import { APIConnection } from "../api/connection";
import Cookies from 'js-cookie'

interface UploadedFile {
  name: string;
  size: number;
  data: ArrayBuffer;
}

const getFileIcon = (fileName: string, className?: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <AiFillFilePdf className={className} />;
    case "doc":
    case "docx":
      return <AiFillFileWord className={className} />;
    case "xls":
    case "xlsx":
      return <AiFillFileExcel className={className} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <AiFillFileImage className={className} />;
    case "js":
      return <SiJavascript className={className} />;
    case "ts":
      return <SiTypescript className={className} />;
    case "html":
      return <SiHtml5 className={className} />;
    case "css":
      return <SiCss3 className={className} />;
    default:
      return <AiFillFile className={className} />;
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TaskAddAttachment() {
  const connection = APIConnection.getInstance();
  const query = useQuery();
  const navigate = useNavigate();
  const task_id = query.get("id");
  const user_code = Cookies.get("user_code");

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task_id) {
    navigate("*", { replace: true });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const processFiles = (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        let buffer: ArrayBuffer;
        if (reader.result instanceof ArrayBuffer) buffer = reader.result;
        else if (typeof reader.result === "string")
          buffer = new TextEncoder().encode(reader.result).buffer;
        else return;

        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          data: buffer,
        };
        setFiles((prev) => [...prev, uploadedFile]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!task_id) return;

    const payload = {
      task_id,
      user_id: user_code,
      attachments: files.map((file) => ({
        name: file.name,
        data: Array.from(new Uint8Array(file.data)),
      })),
    };

    try {
      const res = await connection.post("tasks/setTaskAttachment", payload);
      console.log("Dosyalar yüklendi:", res);
      alert("Dosyalar başarılı şekilde gönderildi!");
      setFiles([]);
    } catch (err) {
      console.error("Dosya yükleme hatası:", err);
      alert("Dosya yükleme sırasında hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text={`GÖREV - Dosya Ekleme`} />

        <div className="p-6">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Dosya Ekle</h2>

              <div
                className="
                  border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center 
                  bg-white cursor-pointer transition-all duration-300 ease-in-out 
                  hover:bg-blue-50 hover:scale-101 hover:border-blue-300
                "
                onClick={handleAreaClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <p className="text-gray-500 text-sm text-center">
                  Dosyalarınızı sürükleyin veya tıklayarak seçin
                </p>
              </div>

              {files.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="
                        flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-xl 
                        shadow-sm hover:shadow-md transition-shadow duration-200 bg-white
                      "
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl text-blue-500">{getFileIcon(file.name)}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{file.name}</span>
                          <span className="text-gray-400 text-xs">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-500 hover:text-red-700 font-bold text-xl transition-colors"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={handleUpload}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Yükle
              </Button>
            </CardContent>
          </Card>
        </div>
      </Page>
    </div>
  );
}
