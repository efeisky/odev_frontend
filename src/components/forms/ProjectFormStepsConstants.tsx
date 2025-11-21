import { useState, useEffect } from "react";
import StatusTypeSection from "./../StatusTypeSection";

export interface Item {
  id: number;
  name: string;
}

interface Props {
  initialStatuses?: Item[];
  initialTypes?: Item[];
  initialPriorities?: Item[];
  error?: string;
  onSave: (items: {
    statuses: Item[];
    types: Item[];
    priorities: Item[];
  }) => Promise<boolean> | boolean;
}

export default function StatusTypeForm({
  initialStatuses = [],
  initialTypes = [],
  initialPriorities = [],
  error,
  onSave,
}: Props) {
  const [statuses, setStatuses] = useState<Item[]>(initialStatuses);
  const [types, setTypes] = useState<Item[]>(initialTypes);
  const [priorities, setPriorities] = useState<Item[]>(initialPriorities);

  const [inputStatus, setInputStatus] = useState("");
  const [inputType, setInputType] = useState("");
  const [inputPriority, setInputPriority] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    setStatuses((prev) => {
      const changed = JSON.stringify(prev) !== JSON.stringify(initialStatuses);
      return changed ? initialStatuses : prev;
    });
  }, [initialStatuses]);

  useEffect(() => {
    setTypes((prev) => {
      const changed = JSON.stringify(prev) !== JSON.stringify(initialTypes);
      return changed ? initialTypes : prev;
    });
  }, [initialTypes]);

  useEffect(() => {
    setPriorities((prev) => {
      const changed = JSON.stringify(prev) !== JSON.stringify(initialPriorities);
      return changed ? initialPriorities : prev;
    });
  }, [initialPriorities]);

  const handleAdd = (
    setter: React.Dispatch<React.SetStateAction<Item[]>>,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!value.trim()) return;
    setter((prev) => [...prev, { id: Date.now(), name: value.trim() }]);
    setValue("");
    setSaveSuccess(null);
  };

  const handleRemove = (
    setter: React.Dispatch<React.SetStateAction<Item[]>>,
    id: number
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
    setSaveSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);

    const result = await onSave({ statuses, types, priorities });

    setIsSaving(false);
    setSaveSuccess(result === true);
  };

  const getButtonColor = () => {
    if (isSaving)
      return "bg-gray-400 cursor-not-allowed pointer-events-none select-none";
    if (saveSuccess === true)
      return "bg-green-500 cursor-default pointer-events-none select-none";
    if (saveSuccess === false)
      return "bg-red-500 cursor-default pointer-events-none select-none";
    return "bg-blue-500 hover:bg-blue-700 cursor-pointer select-none";
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* 3 Bölme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusTypeSection
          title="Durum"
          items={statuses}
          inputValue={inputStatus}
          onInputChange={setInputStatus}
          onAdd={() => handleAdd(setStatuses, inputStatus, setInputStatus)}
          onRemove={(id) => handleRemove(setStatuses, id)}
        />

        <StatusTypeSection
          title="Tip"
          items={types}
          inputValue={inputType}
          onInputChange={setInputType}
          onAdd={() => handleAdd(setTypes, inputType, setInputType)}
          onRemove={(id) => handleRemove(setTypes, id)}
        />

        <StatusTypeSection
          title="Öncelik"
          items={priorities}
          inputValue={inputPriority}
          onInputChange={setInputPriority}
          onAdd={() =>
            handleAdd(setPriorities, inputPriority, setInputPriority)
          }
          onRemove={(id) => handleRemove(setPriorities, id)}
        />
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving ||
            (statuses.length === 0 &&
              types.length === 0 &&
              priorities.length === 0)
          }
          className={`text-white px-5 py-2 rounded-lg transition font-medium shadow-sm ${getButtonColor()}`}
        >
          {isSaving
            ? "Kaydediliyor..."
            : saveSuccess === true
            ? "Kaydedildi"
            : saveSuccess === false
            ? "Kaydedilemedi"
            : "Kaydet"}
        </button>
      </div>

      {error && (
        <div className="flex gap-2 items-center text-red-500 mt-2">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
