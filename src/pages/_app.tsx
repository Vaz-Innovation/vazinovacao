import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";
import { env } from "@/env.mjs";

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
        <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />
        <Toaster />
        <Sonner />
        <HydrationBoundary state={dehydratedState}>
          <Component {...restPageProps} />
        </HydrationBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
