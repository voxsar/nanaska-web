import { useState, useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Stats.css';

const STATS = [
  { target: 50,   suffix: '+', label: 'Expert Tutors',  icon: '👨‍🏫' },
  { target: 4000, suffix: '+', label: 'Students',       icon: '🎓' },
  { target: 16,   suffix: '',  label: 'Courses',        icon: '📚' },
  { target: 20,   suffix: '+', label: 'Countries',      icon: '🌍' },
];

function useCountUp(target, duration = 1800, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return value;
}

function StatItem({ stat, active }) {
  const count = useCountUp(stat.target, 1800, active);
  return (
    <div className="stats__item">
      <span className="stats__icon">{stat.icon}</span>
      <span className="stats__number">
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className="stats__label">{stat.label}</span>
    </div>
  );
}

export default function Stats() {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  useScrollReveal(ref);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats" id="stats" ref={ref}>
      <div className="stats__container" data-reveal-stagger>
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
}
