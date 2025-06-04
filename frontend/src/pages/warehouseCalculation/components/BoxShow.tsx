export default function BoxShow({ label, input }: { label: string, input: string | JSX.Element }) {
    return (
        <div className="mb-6">
            <label className="block text-xl font-bold text-gray-800 mb-2">
                {label}
            </label>
            <div className="bg-gray-50 text-blue-900 rounded-xl px-5 py-3 text-lg font-mono border border-blue-200 shadow-sm">
                {input}
            </div>
        </div>
    )
}
