import { useState, useEffect, useRef } from 'react';

const TypingText = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Очищаем предыдущий интервал, если он был
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Сбрасываем состояние
    currentIndexRef.current = 0;
    setDisplayedText('');

    // Запускаем новый интервал
    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current < text.length) {
        setDisplayedText((prev) => prev + text[currentIndexRef.current]);
        currentIndexRef.current++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, speed);

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed]);

  return <span>{displayedText}</span>;
};