export const dynamic = "force-dynamic";

import { listPages, prisma } from "@cms/db";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const [pages, lastPublish] = await Promise.all([
    listPages(),
    prisma.publishLog.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const publishedPages = pages.filter((p) => p.status === "published").length;

  return (
    <DashboardClient
      data={{
        pagesCount: pages.length,
        publishedPages,
        draftPages: pages.length - publishedPages,
        lastPublish: lastPublish
          ? {
              status: lastPublish.status,
              message: lastPublish.message,
              createdAt: lastPublish.createdAt.toISOString(),
            }
          : null,
        draftPagesList: pages
          .filter((p) => p.status === "draft")
          .slice(0, 5)
          .map((p) => ({ id: p.id, title: p.title })),
      }}
    />
  );
}
