
import { useState, useEffect } from 'react';
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon';
import 'animate.css';
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-[#D04A33] text-white shadow-lg hover:bg-[#B8422B] transition-all duration-300 ${
        isVisible
          ? 'opacity-100 animate__slideInUp animate__animated'
          : 'opacity-0'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUpSLineIcon size={24} />
    </button>
  );
};

export default ScrollToTop;