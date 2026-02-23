import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFoundPage = () => {
  return (
    <main className="container mx-auto flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="h-7 w-7" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">404</CardTitle>
          <CardDescription className="text-base">
            La pagina que intentas visitar no existe o fue movida.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-sm text-muted-foreground">
          Verifica la URL o regresa a una seccion principal de GymCloud.
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Ir a iniciar sesion</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default NotFoundPage;
