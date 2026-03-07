export default function StartsPage() {
  const starts = [
    { id: 1, flow: "WAKA INTER PROD FLUJO FR", contacts: 156, date: "6/3/2026, 18:37" },
    { id: 2, flow: "WAKA DEMO KYC TEST V1", contacts: 42, date: "6/3/2026, 18:33" },
    { id: 3, flow: "nigeria HAUSA WAKA INTER", contacts: 89, date: "6/3/2026, 18:08" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Flow Starts</h1>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Flow</th>
              <th className="px-6 py-3 text-center">Contacts</th>
              <th className="px-6 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {starts.map((s) => (
              <tr key={s.id} className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm font-medium text-primary">{s.flow}</td>
                <td className="px-6 py-3 text-sm text-center text-muted-foreground">{s.contacts}</td>
                <td className="px-6 py-3 text-sm text-right text-muted-foreground">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
