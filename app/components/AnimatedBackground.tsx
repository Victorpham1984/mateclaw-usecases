"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient mesh - Option A */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-gradient-rotate">
          <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-blue-500/20 dark:bg-blue-500/10 blur-[120px]" />
          <div className="absolute top-[50%] left-[60%] w-[35vw] h-[35vw] rounded-full bg-purple-500/20 dark:bg-purple-500/10 blur-[120px]" />
          <div className="absolute top-[30%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-pink-500/15 dark:bg-pink-500/8 blur-[120px]" />
        </div>
      </div>
    </div>
  );
}
