import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useState } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

type AppPageProps = {
  dehydratedState?: DehydratedState;
};

export default function App({ Component, pageProps }: AppProps<AppPageProps>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const { dehydratedState, ...restPageProps } = pageProps;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HydrationBoundary state={dehydratedState}>
          <Component {...restPageProps} />
        </HydrationBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
