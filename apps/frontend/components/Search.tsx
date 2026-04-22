// components/Search.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Search = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Локальное состояние инпута — то, что видит пользователь при печати.
  // Обновляется мгновенно, чтобы поле ввода было отзывчивым.
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  // Debounce: через 300мс после последнего изменения value
  // пушим его в URL. Каждое новое нажатие сбрасывает таймер.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSearch = searchParams.get('search') ?? '';

      // Не пушим URL если значение не изменилось (например при первом рендере).
      if (value === currentSearch) return;

      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      // replace, не push — чтобы не засорять историю браузера
      // каждым нажатием клавиши.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    // Cleanup: при следующем изменении value таймер сбросится.
    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="flex items-center justify-end my-6">
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="ring-1 ring-gray-200 shadow-md p-2 rounded-sm w-full max-w-sm"
      />
    </div>
  );
};

export default Search;
