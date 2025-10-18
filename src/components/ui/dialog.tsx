import React, { createContext, useContext, useState } from "react";

const Ctx = createContext<{open:boolean,setOpen:(v:boolean)=>void}|null>(null);

export const Dialog: React.FC<{children:any}> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return <Ctx.Provider value={{open,setOpen}}>{children}</Ctx.Provider>;
};

export const DialogTrigger: React.FC<{asChild?:boolean, children:any}> = ({ children }) => {
  const ctx = useContext(Ctx)!;
  return <span onClick={()=>ctx.setOpen(true)} className="inline-block">{children}</span>;
};

export const DialogContent: React.FC<{children:any}> = ({ children }) => {
  const ctx = useContext(Ctx)!;
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={()=>ctx.setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-slate-900 p-4 border border-slate-700 shadow-xl">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{children:any}> = ({ children }) => <div className="mb-3">{children}</div>;
export const DialogTitle: React.FC<{children:any}> = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
