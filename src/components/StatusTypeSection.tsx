export interface Item {
  id: number;
  name: string;
}

interface Props {
  title: string;
  items: Item[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}
export default function StatusTypeSection({
  title,
  items,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className="flex-1">
      <label className="block text-sm text-gray-700 mb-1 font-medium">
        {title} Ekle
      </label>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
          placeholder={`${title} adı`}
        />
        <button
          type="button"
          onClick={onAdd}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          Ekle
        </button>
      </div>

      {/* Tablonun her zaman görünmesi için koşulu kaldırıyoruz */}
      <table className="min-w-full border-collapse text-sm border border-gray-200 rounded">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">{title}</th>
            <th className="px-4 py-2 text-center font-semibold w-20">Sil</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-100 hover:bg-blue-50 transition"
              >
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-600 font-medium transition bg-red-50 hover:bg-red-100 px-2 py-1 rounded cursor-pointer"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={2}
                className="text-center text-gray-400 py-3 italic select-none"
              >
                Henüz {title.toLowerCase()} eklenmedi
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}