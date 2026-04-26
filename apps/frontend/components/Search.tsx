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
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="bg-white/20 placeholder-white/70 text-white px-3 py-1.5 rounded-md w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-white/50"
    />
  );
};

export default Search;
