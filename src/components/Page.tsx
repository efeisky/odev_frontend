import React, { type ReactNode } from "react";

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <div className="flex-1 ml-60 p-8">
      {children}
    </div>
  );
};

export default Page;
