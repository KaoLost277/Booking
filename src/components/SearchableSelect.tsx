import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
    id: string | number;
    label: string;
}

export interface SearchableSelectProps {
    label: string;
    icon?: React.ReactNode;
    options: SelectOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    icon,
    options,
    value,
    onChange,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedLabel = options.find(opt => opt.id === value)?.label || '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full relative" ref={containerRef}>
            {label ? (
                <label className="block text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] uppercase tracking-wider mb-1.5 ml-0.5">
                    {label}
                </label>
            ) : null}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 w-full h-11 px-3 rounded-lg border bg-white dark:bg-[#1a1a1a] cursor-pointer transition-all duration-150 ${isOpen
                    ? 'border-[#0d0d0d] dark:border-[#ececf1] ring-1 ring-[#0d0d0d]/10 dark:ring-[#ececf1]/10'
                    : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654]'
                    }`}
            >
                {icon && <span className="text-[#6e6e80] dark:text-[#8e8ea0] shrink-0">{icon}</span>}
                <span className={`flex-1 text-sm truncate ${!selectedLabel ? 'text-[#acacbe] dark:text-[#6e6e80]' : 'text-[#0d0d0d] dark:text-[#ececf1]'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#acacbe] dark:text-[#6e6e80] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-1.5 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-lg dark:shadow-none overflow-hidden">
                    <div className="p-2 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                        <div className="flex items-center gap-2 px-2.5 bg-[#f7f7f8] dark:bg-[#2a2a2a] rounded-md border border-[#e5e5e5] dark:border-[#353740]">
                            <Search className="w-4 h-4 text-[#acacbe] dark:text-[#6e6e80] shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ค้นหา..."
                                className="w-full h-9 bg-transparent text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${value === opt.id
                                        ? 'bg-[#f7f7f8] dark:bg-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececf1] font-medium'
                                        : 'text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]'
                                        }`}
                                >
                                    {opt.label}
                                    {value === opt.id && <Check className="w-4 h-4 shrink-0 text-[#10a37f]" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-center text-sm text-[#acacbe] dark:text-[#6e6e80]">
                                ไม่พบข้อมูลที่ค้นหา
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
