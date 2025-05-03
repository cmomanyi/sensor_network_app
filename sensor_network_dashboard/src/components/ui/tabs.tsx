import * as React from "react";

export function Tabs({ children }: { children: React.ReactNode }) {
    return <div className="space-y-2">{children}</div>;
}

export function TabsList({ children }: { children: React.ReactNode }) {
    return <div className="flex space-x-2">{children}</div>;
}

export function TabsTrigger({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
            {children}
        </button>
    );
}

export function TabsContent({ children }: { children: React.ReactNode }) {
    return <div className="p-4 border rounded bg-white shadow">{children}</div>;
}
