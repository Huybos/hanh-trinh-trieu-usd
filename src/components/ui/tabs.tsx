import React, { createContext, useContext, useState } from "react";

const Ctx = createContext<{value:string,setValue:(v:string)=>void}|null>(null);

export const Tabs: React.FC<{defaultValue:string, children:any}> = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return <Ctx.Provider value={{value,setValue}}><div className="space-y-3">{children}</div></Ctx.Provider>;
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) =>
  <div className={`inline-grid rounded-xl bg-white/5 p-1 gap-1 ${className||""}`} {...p} />;

export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {value:string}> = ({ value, className, children, ...p }) => {
  const ctx = useContext(Ctx)!;
  const active = ctx.value===value;
  return (
    <button
      onClick={()=>ctx.setValue(value)}
      className={`px-4 py-2 rounded-lg text-sm ${active?"bg-cyan-600 text-white":"text-gray-200 hover:bg-white/10"} ${className||""}`}
      {...p}
    >{children}</button>
  );
};

export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & {value:string}> = ({ value, className, ...p }) => {
  const ctx = useContext(Ctx)!;
  if (ctx.value!==value) return null;
  return <div className={className} {...p} />;
};
