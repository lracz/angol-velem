import { useState, useMemo } from 'react';
import { Book, Search, X } from 'lucide-react';

export function DictionaryTab({ vocabMap, vocabulary }) {
    const [searchTerm, setSearchTerm] = useState('');

    const learnedWords = useMemo(() => {
        if (!vocabMap) return [];
        return vocabulary.filter(v => vocabMap[v.id]);
    }, [vocabMap, vocabulary]);

    const filteredWords = useMemo(() => {
        if (!searchTerm) return learnedWords;
        const term = searchTerm.toLowerCase();
        return learnedWords.filter(v =>
            v.english.toLowerCase().includes(term) ||
            v.hungarian.toLowerCase().includes(term)
        );
    }, [learnedWords, searchTerm]);

    return (
        <div className="flex flex-col gap-4 animate-slide-up pb-20">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
                    <Book size={28} className="text-purple-500" /> Szótár
                </h2>
                <p className="text-sm text-gray-500 mt-1">Az eddig tanult szavaid gyűjteménye ({learnedWords.length} db)</p>
            </div>

            <div className="relative sticky top-16 z-30">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Keresés angolul vagy magyarul..."
                    className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="grid gap-3 mt-2">
                {filteredWords.length === 0 ? (
                    <div className="text-center p-8 bg-white/50 rounded-3xl border border-gray-100">
                        <p className="text-gray-500 font-medium">Nincs találat.</p>
                    </div>
                ) : (
                    filteredWords.map(w => (
                        <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="text-3xl flex-shrink-0 bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center">{w.emoji}</div>
                            <div className="flex-1">
                                <div className="font-black text-lg text-gray-800">{w.english}</div>
                                <div className="text-sm text-gray-500 font-medium">{w.hungarian}</div>
                            </div>
                            <div className="flex-shrink-0 text-xs font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                                {vocabMap[w.id] === 'known' ? 'Megtanult' : 'Ismétlős'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
