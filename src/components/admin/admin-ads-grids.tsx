"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Frown, FileSignature } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import type { Job, Competition, ImmigrationPost } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { CompetitionCard } from "@/components/competition-card";
import { ImmigrationCard } from "@/components/immigration-card";

export function LoadMoreButton({
  onClick,
  loading,
  hasMore,
}: {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-6 pb-2">
      <Button
        onClick={onClick}
        disabled={loading}
        variant="outline"
        className="min-w-[150px] active:scale-95 transition-transform"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري التحميل...
          </>
        ) : (
          "تحميل المزيد"
        )}
      </Button>
    </div>
  );
}

export function AdGrid({
  ads,
  onAdDelete,
  showEditButton = false,
  emptyMessage = "لا توجد إعلانات في هذا القسم.",
}: {
  ads: Job[];
  onAdDelete: (adId: string) => void;
  showEditButton?: boolean;
  emptyMessage?: string;
}) {
  if (ads.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ads.map((ad) => (
        <Card key={ad.id} className="flex flex-col">
          <div className="flex-grow">
            <JobCard job={ad} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            {showEditButton && (
              <Button
                asChild
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Link href={`/edit-job/${ad.id}`}>
                  <FileSignature className="h-4 w-4" />
                  <span>تعديل</span>
                </Link>
              </Button>
            )}
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(ad.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function ImmigrationGrid({
  posts,
  onAdDelete,
}: {
  posts: ImmigrationPost[];
  onAdDelete: (postId: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد إعلانات هجرة في هذا القسم.</p>
      </div>
    );
  }
  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col">
          <div className="flex-grow">
            <ImmigrationCard post={post} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-immigration/${post.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(post.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function CompetitionGrid({
  competitions,
  onAdDelete,
}: {
  competitions: Competition[];
  onAdDelete: (adId: string) => void;
}) {
  if (competitions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد مباريات في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {competitions.map((comp) => (
        <Card key={comp.id} className="flex flex-col">
          <div className="flex-grow">
            <CompetitionCard competition={comp} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-competition/${comp.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(comp.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
