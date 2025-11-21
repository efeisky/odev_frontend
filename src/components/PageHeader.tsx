import React from "react";

interface PageProps {
  text: string;
}

const PageHeader: React.FC<PageProps> = ({ text }) => {
  return (
    <div>
      <h1 className="font-semibold text-xl">{text}</h1>
      <hr className="border-blue-700 border-2 rounded-full mt-2 mb-8 w-32" />
    </div>
  );
};

export default PageHeader;
