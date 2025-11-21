import React from "react";

interface StepContentProps {
  form: React.ReactNode; // dışarıdan gönderilecek JSX (form bileşeni)
}

export default function StepContent({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {form ? (
        form
      ) : (
        <p className="text-gray-500 text-sm italic">
          Bu adıma ait form bileşeni belirtilmemiş.
        </p>
      )}
    </div>
  );
}
