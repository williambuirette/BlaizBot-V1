import { Card, CardContent } from '@/components/ui/card';

interface WelcomeCardProps {
  userName: string;
}

export function WelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold">Bonjour, {userName} 👋</h1>
        <p className="text-blue-100 mt-1">
          Prêt à apprendre quelque chose de nouveau aujourd&apos;hui ?
        </p>
      </CardContent>
    </Card>
  );
}
