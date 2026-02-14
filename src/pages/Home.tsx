import React from "react";
import { Link } from "react-router-dom";
import { getModels } from "@/models";

export default function Home() {
  const models = getModels();

  return (
    <div className="w-full min-h-full bg-[var(--bg-color)]">
      <div className="flex flex-col justify-center items-center w-full p-8 bg-gradient-to-t from-[var(--color-header-secondary)] to-[var(--color-header-primary)] text-white">
        <h1 className="p-0 m-0 mb-2 text-3xl font-light">VibeCad Studio</h1>
        <div>Build and share CAD models for 3D printing</div>
      </div>
      <div className="p-8">
        <div className="flex m-4 flex-row flex-wrap justify-center">
          {models.map((model) => (
            <Link
              key={model.slug}
              to={`/workbench/${model.slug}`}
              className="flex flex-col justify-between m-2.5 p-4 w-[300px] border border-[var(--color-primary)] rounded-[3px] no-underline text-inherit hover:bg-[var(--color-primary-light)] dark:hover:bg-[var(--color-primary-dark)]"
            >
              <div className="text-xl">{model.name}</div>
              <div className="font-light my-1">{model.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
