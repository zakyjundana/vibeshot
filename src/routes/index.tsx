import { createFileRoute } from "@tanstack/react-router";
import { VibeShotPlatform } from "../components/VibeShotPlatform";

export const Route = createFileRoute("/")({
  component: VibeShotPlatform,
});
