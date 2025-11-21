import { useRef } from "react";
import {
  AiFillFilePdf,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFileImage,
  AiFillFile,
} from "react-icons/ai";
import { SiJavascript, SiHtml5, SiCss3, SiTypescript } from "react-icons/si";

export interface UploadedFile {
  name: string;
  size: number;
  data: ArrayBuffer;
}
interface Props {
  files: UploadedFile[];
  onChangeFiles: (files: UploadedFile[]) => void; 
}

const getFileIcon = (fileName: string, className?: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return <AiFillFilePdf className={className} />;
    case "doc":
    case "docx": return <AiFillFileWord className={className} />;
    case "xls":
    case "xlsx": return <AiFillFileExcel className={className} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif": return <AiFillFileImage className={className} />;
    case "js": return <SiJavascript className={className} />;
    case "ts": return <SiTypescript className={className} />;
    case "html": return <SiHtml5 className={className} />;
    case "css": return <SiCss3 className={className} />;
    default: return <AiFillFile className={className} />;
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export default function TaskFormStepsAttachmentEdit({ files, onChangeFiles }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        onChangeFiles([...files, uploadedFile]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    onChangeFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 transition hover:shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Görev Dosyaları</h2>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); processFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-gray-500 text-sm text-center">
          Dosyalarınızı sürükleyin veya bu alana tıklayarak seçin
        </p>
      </div>

      <div className="mt-6">
        {files.length === 0 ? (
          <p className="text-gray-400 italic text-sm">Dosya yüklenmedi.</p>
        ) : (
          <>
            <h3 className="font-semibold text-gray-800 mb-3">Yüklenen Dosyalar</h3>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-gray-600">{getFileIcon(file.name)}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-gray-400 hover:text-red-500 transition font-semibold text-lg"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

