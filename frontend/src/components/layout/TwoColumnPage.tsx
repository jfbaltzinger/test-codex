import React from 'react';

interface TwoColumnPageProps {
  main: React.ReactNode;
  sidebar: React.ReactNode;
}

export const TwoColumnPage: React.FC<TwoColumnPageProps> = ({ main, sidebar }) => (
  <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
    <div className="space-y-6">{main}</div>
    <aside className="space-y-6">{sidebar}</aside>
  </div>
);
