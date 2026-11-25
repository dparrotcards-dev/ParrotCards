import React from 'react';
import { Moon, Sun, Sunrise } from 'lucide-react';

const rituals = [
  {
    title: 'Morning Intention',
    time: '5 minutes',
    description: 'Begin the day with a quiet moment and choose one intention to carry into your day.',
    steps: ['Sit somewhere comfortable', 'Take a few slow, comfortable breaths', 'Name one quality you want to bring to today'],
    Icon: Sunrise,
  },
  {
    title: 'Midday Pause',
    time: '2 minutes',
    description: 'Take a short break to notice the present before returning to what is in front of you.',
    steps: ['Step away from your current task', 'Notice what you can see and hear', 'Return when you feel ready'],
    Icon: Sun,
  },
  {
    title: 'Evening Reflection',
    time: '5 minutes',
    description: 'Close the day with a little space to reflect, without judging how the day went.',
    steps: ['Recall one thing you appreciated', 'Notice one thing you learned', 'Choose one small focus for tomorrow'],
    Icon: Moon,
  },
];

export const DailyRitualsPage: React.FC = () => (
  <div className="relative z-[1] flex-1 px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8">
    <section className="mx-auto max-w-5xl">
      <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <div className="flex items-center justify-center gap-3 font-cinzel text-[11px] font-bold uppercase tracking-[0.35em] text-[#8C6D3B]">
          <Sun aria-hidden="true" className="h-4 w-4" />
          <span>Daily Rituals</span>
          <Sun aria-hidden="true" className="h-4 w-4" />
        </div>
        <h1 className="mt-3 font-cormorant text-4xl font-bold text-[#2A1D14] sm:text-5xl">
          Make Space for Yourself
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#635B50] sm:text-base">
          Simple moments for setting an intention, pausing during the day, and reflecting in the evening.
          Keep what feels useful and make each practice your own.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {rituals.map(({ title, time, description, steps, Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-[#E5DDD0] bg-[#FFFDF9]/90 p-5 shadow-[0_4px_18px_rgba(70,50,20,0.05)] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3EBDD] text-[#8C6D3B]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="rounded-full border border-[#E5DDD0] px-3 py-1 font-cinzel text-[10px] font-semibold uppercase tracking-wider text-[#79531F]">
                {time}
              </span>
            </div>
            <h2 className="mt-5 font-cinzel text-base font-bold text-[#2A1D14]">{title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-[#635B50]">{description}</p>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#47382D]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3EBDD] font-cinzel text-[10px] font-bold text-[#79531F]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-[#7A7064]">
        These are optional reflection prompts, not professional or medical advice. Adapt or skip any practice to suit yourself.
      </p>
    </section>
  </div>
);
