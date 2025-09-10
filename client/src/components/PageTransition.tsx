import { useEffect } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('category-fade-in');
    return () => {
      document.body.classList.remove('category-fade-in');
    };
  }, []);
  return <div className="category-fade-in">{children}</div>;
}
