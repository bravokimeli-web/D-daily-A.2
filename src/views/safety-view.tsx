"use client";

const guides = [
  { t: "Mosquito prevention", d: "Drain stagnant water, use nets at night, apply repellent on exposed skin, and wear our wristband for travel." },
  { t: "Safe herbicide use", d: "Wear gloves and a mask. Apply during calm weather. Never spray near water sources or food crops." },
  { t: "Snake-aware homes", d: "Clear bush around the perimeter, store firewood off the ground, and reapply repellent powder after rain." },
  { t: "Indoor protection", d: "Seal cracks, store food in sealed containers, and treat hotspots with our spray or sachet powder weekly." },
];

export function SafetyView() {
  return (
    <div className="container-px mx-auto max-w-4xl py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Safety & Education</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Use it right. Stay safe.</h1>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {guides.map((g) => (
          <article key={g.t} className="rounded-2xl border bg-card p-6">
            <h2 className="font-display font-bold text-xl">{g.t}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{g.d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
