import { Link } from "react-router-dom";

export default function SharedDocs({ documents }) {
    return (
        <section className="rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Shared With You ({documents.length})
          </h2>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {documents.length === 0 ? (
              <p className="text-gray-500">No shared documents</p>
            ) : (
              <ul className="space-y-3">
                {documents.map(doc => (
                  <li key={doc.docId} className="p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <Link
                          to={`/editor/${doc.docId}`}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-sm text-gray-500">Owner: @{doc.owner}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );
}
