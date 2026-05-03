// Pretty-printed JSON block. Used in every view to expose the raw API
// payload so the example doubles as a request/response inspector.
const JsonView = ({ data, label }) => (
  <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 overflow-hidden">
    {label && (
      <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-700/60">
        {label}
      </div>
    )}
    <pre className="px-4 py-3 text-xs font-mono text-slate-300 overflow-auto max-h-96 leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

export default JsonView;
