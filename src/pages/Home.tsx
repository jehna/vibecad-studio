import React from "react";
import { Link } from "react-router-dom";
import { getModels } from "@/models";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Home() {
  const models = getModels();

  return (
    <div className="w-full min-h-full bg-background">
      <div className="flex flex-col justify-center items-center w-full p-8 bg-primary text-primary-foreground">
        <h1 className="p-0 m-0 mb-2 text-3xl font-light">VibeCad Studio</h1>
        <div>Vibe coded shareable models for 3d printing</div>
      </div>
      <div className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Link
              key={model.slug}
              to={`/workbench/${model.slug}`}
              className="no-underline text-inherit"
            >
              <Card className="h-full transition-colors hover:border-primary hover:bg-accent">
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
