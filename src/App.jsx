import ParticleSphere from "./components/particle-sphere/ParticleSphere";

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#080808]">
      <div className="h-[min(90vw,700px)] w-[min(90vw,700px)]">
        <ParticleSphere />
      </div>
    </main>
  );
}
