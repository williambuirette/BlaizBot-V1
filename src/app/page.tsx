import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">🤖 BlaizBot</h1>
      <p className="text-lg text-muted-foreground">
        Plateforme éducative avec IA intégrée
      </p>
      <Button size="lg">Test shadcn/ui</Button>
    </div>
  );
}
