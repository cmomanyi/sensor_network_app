// src/components/ui/card.jsx

export const Card = ({ children }) => (
    <div className="bg-white rounded-2xl shadow p-4">{children}</div>
);

export const CardContent = ({ children }) => (
    <div className="mt-2">{children}</div>
);

export const CardHeader = ({ children }) => (
    <div className="border-b pb-2 mb-2">{children}</div>
);

export const CardTitle = ({ children }) => (
    <h3 className="text-xl font-semibold">{children}</h3>
);
